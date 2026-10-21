import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { localUploadsDir } from '../src/lib/storage.js'
import { Media } from '../src/modules/media/media.model.js'
import { ADMIN_ORIGIN, app, loginAs } from './helpers.js'

let editor
let photo // a 3000x2000 JPEG

// the database (sessions included) is emptied after every test
beforeEach(async () => {
  ;({ agent: editor } = await loginAs('editor'))
})

beforeAll(async () => {
  photo = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#c24f08' } }).jpeg().toBuffer()
})

afterAll(async () => {
  await fs.rm(localUploadsDir, { recursive: true, force: true })
})

const upload = (agent, files) => {
  let req = agent.post('/api/admin/media').set('Origin', ADMIN_ORIGIN)
  for (const [i, file] of files.entries()) {
    req = req.attach('files', file.buffer ?? photo, file.name ?? `photo-${i}.jpg`).field('alt', file.alt ?? 'Fencers on the piste')
  }
  return req
}

async function uploadOne(alt = 'Riders at the start line') {
  const res = await upload(editor, [{ alt }])
  expect(res.status).toBe(201)
  return res.body.media[0]
}

describe('media uploads', () => {
  it('makes three WebP sizes, never bigger than 2000px, and serves them locally', async () => {
    const media = await uploadOne()
    expect(media).toMatchObject({ alt: 'Riders at the start line', width: 2000, height: 1333 })
    expect(media.urls.medium).toMatch(/^\/api\/uploads\/media\/\d{4}\/\d{2}\/[a-z0-9]{20}\/medium\.webp$/)

    const file = await request(app).get(media.urls.thumb)
    expect(file.status).toBe(200)
    expect(file.headers['content-type']).toBe('image/webp')
    const meta = await sharp(file.body).metadata()
    expect(meta.width).toBe(480)
  })

  it('needs a description for every photo', async () => {
    const res = await upload(editor, [{ alt: 'ok' }])
    expect(res.status).toBe(400)
    expect(res.body.error.fields.alt).toBeDefined()
  })

  it('rejects files that are not photos', async () => {
    const res = await upload(editor, [{ buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'), name: 'x.svg' }])
    expect(res.status).toBe(400)
    expect(await Media.countDocuments({ originalName: 'x.svg' })).toBe(0)
  })

  it('rejects more than 10 files at once', async () => {
    const res = await upload(editor, Array.from({ length: 11 }, () => ({ buffer: Buffer.from('x') })))
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('TOO_MANY_FILES')
  })

  it('is closed to visitors', async () => {
    const res = await request(app).get('/api/admin/media')
    expect(res.status).toBe(401)
  })

  it('deletes a photo and its files', async () => {
    const media = await uploadOne()
    const del = await editor.delete(`/api/admin/media/${media.id}`).set('Origin', ADMIN_ORIGIN)
    expect(del.status).toBe(204)
    const folder = path.join(localUploadsDir, path.dirname(media.urls.thumb.replace('/api/uploads/', '')))
    await expect(fs.readdir(folder).then((names) => names.length)).resolves.toBe(0)
  })
})

describe('site photos', () => {
  const put = (key, body) => editor.put(`/api/admin/site-photos/${key}`).set('Origin', ADMIN_ORIGIN).send(body)
  const restore = (key) => editor.delete(`/api/admin/site-photos/${key}`).set('Origin', ADMIN_ORIGIN)

  it('starts with every spot showing its original photo', async () => {
    const site = await request(app).get('/api/site-photos')
    expect(site.headers['cache-control']).toContain('public')
    expect(site.body.photos).toEqual([])
  })

  it('changes only the caption of an original photo', async () => {
    const res = await put('gallery.3', { alt: 'Results from Bali' })
    expect(res.status).toBe(200)
    expect(res.body.photo).toMatchObject({ key: 'gallery.3', alt: 'Results from Bali', media: null })

    const site = await request(app).get('/api/site-photos')
    expect(site.body.photos).toEqual([{ key: 'gallery.3', alt: 'Results from Bali' }])
  })

  it('replaces a photo, deletes the one it replaced, and restores the original', async () => {
    const a = await uploadOne('Photo A')
    const b = await uploadOne('Photo B')

    expect((await put('gallery.0', { media: a.id, alt: 'Caption A' })).status).toBe(200)
    expect((await put('gallery.1', { alt: 'Featured caption' })).status).toBe(200)
    let site = await request(app).get('/api/site-photos')
    const gallery0 = site.body.photos.find((photo) => photo.key === 'gallery.0')
    expect(gallery0).toMatchObject({ alt: 'Caption A', width: 2000, height: 1333 })
    expect(gallery0.src).toContain('/medium.webp')

    // a photo shown on the website can't be deleted from the library
    expect((await editor.delete(`/api/admin/media/${a.id}`).set('Origin', ADMIN_ORIGIN)).status).toBe(409)

    // a caption-only change keeps the photo
    const captioned = await put('gallery.0', { alt: 'New caption' })
    expect(captioned.body.photo.media.id).toBe(a.id)

    // replacing it again deletes photo A
    await put('gallery.0', { media: b.id, alt: 'Caption B' })
    expect(await Media.exists({ _id: a.id })).toBeNull()

    expect((await restore('gallery.0')).status).toBe(204)
    expect(await Media.exists({ _id: b.id })).toBeNull()
    site = await request(app).get('/api/site-photos')
    expect(site.body.photos.map((photo) => photo.key)).toEqual(['gallery.1'])

    // restoring a spot that was never changed is fine
    expect((await restore('gallery.0')).status).toBe(204)
  })

  it('needs a caption, a real spot and an existing photo', async () => {
    expect((await put('gallery.0', { alt: 'ok' })).body.error.fields.alt).toBeDefined()
    expect((await put('hero.0', { alt: 'Fine caption' })).status).toBe(400)
    expect((await put('news.featured', { alt: 'Fine caption' })).status).toBe(400)
    expect((await put('gallery.0', { alt: 'Fine caption', media: '0123456789abcdef01234567' })).status).toBe(400)
  })

  it('is closed to visitors and needs the admin origin for changes', async () => {
    expect((await request(app).get('/api/admin/site-photos')).status).toBe(401)
    const res = await editor.put('/api/admin/site-photos/gallery.0').set('Origin', 'http://evil.test').send({ alt: 'Fine caption' })
    expect(res.status).toBe(403)
  })
})
