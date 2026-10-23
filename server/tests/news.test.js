import fs from 'node:fs/promises'
import sharp from 'sharp'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { builtInNews } from '../../Frontend-v2/src/data/news.js'
import { localUploadsDir } from '../src/lib/storage.js'
import { Media } from '../src/modules/media/media.model.js'
import { importBuiltIn, uploadBuiltInPhotos } from '../src/modules/news/news.service.js'
import { ADMIN_ORIGIN, app, loginAs } from './helpers.js'

let editor
let photo

beforeAll(async () => {
  photo = await sharp({ create: { width: 1600, height: 1000, channels: 3, background: '#0a72b5' } }).jpeg().toBuffer()
})

beforeEach(async () => {
  ;({ agent: editor } = await loginAs('editor'))
})

afterAll(async () => {
  await fs.rm(localUploadsDir, { recursive: true, force: true })
})

const send = (method, path, body) => editor[method](`/api/admin/news${path}`).set('Origin', ADMIN_ORIGIN).send(body)

async function uploadPhoto(alt = 'Fencers on the piste') {
  const res = await editor.post('/api/admin/media').set('Origin', ADMIN_ORIGIN).attach('files', photo, 'p.jpg').field('alt', alt)
  expect(res.status).toBe(201)
  return res.body.media[0]
}

const storyWith = (images, extra = {}) => ({
  tag: 'Coaching · May 2026',
  title: 'A new coaching course',
  lead: 'Twenty coaches joined the course.',
  body: [
    { type: 'h4', text: 'Partners' },
    { type: 'list', items: [{ strong: 'UIPM', text: 'for its support.' }] },
  ],
  links: [{ label: '#MPFSL', href: 'https://www.facebook.com/hashtag/mpfsl' }],
  images,
  ...extra,
})

describe('built-in stories', () => {
  it('are copied into an empty database once, and served to the website', async () => {
    expect(await importBuiltIn(builtInNews)).toBe(6)
    expect(await importBuiltIn(builtInNews)).toBe(0)

    const site = await request(app).get('/api/news')
    expect(site.headers['cache-control']).toContain('public')
    expect(site.body.featured).toMatchObject({
      title: builtInNews.featured.title,
      feature: { heading: builtInNews.featured.feature.heading, stat: { value: '28th' } },
    })
    expect(site.body.featured.feature.milestones).toHaveLength(3)
    expect(site.body.stories.map((story) => story.title)).toEqual(builtInNews.stories.map((story) => story.title))
    expect(site.body.stories[0].images[0].src).toMatch(/^\/images\/news\/.+\.jpg$/)
  })

  it('can have their photos moved into photo storage (once)', async () => {
    await importBuiltIn(builtInNews)
    const read = async () => photo
    expect(await uploadBuiltInPhotos(read)).toEqual({ uploaded: 16, stories: 6 })
    expect(await Media.countDocuments()).toBe(16)

    const site = await request(app).get('/api/news')
    expect(site.body.featured.images[0].src).toContain('/medium.webp')
    expect(site.body.featured.images[0].alt).toBe(builtInNews.featured.images[0].alt)
    expect(site.body.stories.flatMap((s) => s.images).every((i) => i.large)).toBe(true)

    expect(await uploadBuiltInPhotos(read)).toEqual({ uploaded: 0, stories: 0 })
  })
})

describe('news admin', () => {
  it('creates a draft, publishes, edits, features, reorders and deletes stories', async () => {
    await importBuiltIn(builtInNews)
    const a = await uploadPhoto('Photo A')
    const b = await uploadPhoto('Photo B')

    const created = await send('post', '', storyWith([{ media: a.id, alt: 'Coaches in a session' }]))
    expect(created.status).toBe(201)
    const story = created.body.story
    expect(story).toMatchObject({ status: 'draft', featured: false })
    expect(story.images[0].preview).toContain('/medium.webp')

    // drafts aren't on the website
    let site = await request(app).get('/api/news')
    expect(site.body.stories.map((s) => s.id)).not.toContain(story.id)

    await send('put', `/${story.id}/status`, { status: 'published' })
    site = await request(app).get('/api/news')
    expect(site.body.stories[0]).toMatchObject({ id: story.id, title: 'A new coaching course' })
    expect(site.body.stories[0].images[0].large).toContain('/large.webp')

    // swapping the photo deletes the one it replaced
    const edited = await send('put', `/${story.id}`, storyWith([{ media: b.id, alt: 'New caption' }], { status: 'published', title: 'Renamed' }))
    expect(edited.status).toBe(200)
    expect(edited.body.story.title).toBe('Renamed')
    expect(await Media.exists({ _id: a.id })).toBeNull()

    // featuring it makes the old featured story a normal one
    const featured = await send('post', `/${story.id}/feature`)
    expect(featured.body.story.feature.heading).toBe('Renamed')
    site = await request(app).get('/api/news')
    expect(site.body.featured.id).toBe(story.id)
    expect(site.body.stories.map((s) => s.title)).toContain(builtInNews.featured.title)

    // order
    const list = (await editor.get('/api/admin/news')).body.stories
    const ids = list.map((s) => s.id).reverse()
    const reordered = await send('put', '/order', { ids })
    expect(reordered.body.stories.map((s) => s.id)).toEqual(ids)

    // a photo used by a story can't be deleted from the library; deleting the story deletes it
    expect((await editor.delete(`/api/admin/media/${b.id}`).set('Origin', ADMIN_ORIGIN)).status).toBe(409)
    expect((await send('delete', `/${story.id}`)).status).toBe(204)
    expect(await Media.exists({ _id: b.id })).toBeNull()
  })

  it('checks what is filled in', async () => {
    const builtIn = [{ src: '/images/news/bali-2023-results.jpg', alt: 'Results from Bali' }]
    expect((await send('post', '', storyWith([]))).status).toBe(400)
    expect((await send('post', '', storyWith([{ src: 'https://evil.test/x.jpg', alt: 'Some photo' }]))).status).toBe(400)
    expect((await send('post', '', storyWith(builtIn, { links: [{ label: 'x', href: 'javascript:alert(1)' }] }))).status).toBe(400)
    const badHighlight = storyWith(builtIn, { feature: { heading: 'Big win', highlight: 'Nagoya' } })
    expect((await send('post', '', badHighlight)).body.error.fields['feature.highlight']).toBeDefined()
    expect((await send('post', '', storyWith(builtIn))).status).toBe(201)
  })

  it('is closed to visitors and needs the admin origin for changes', async () => {
    expect((await request(app).get('/api/admin/news')).status).toBe(401)
    const res = await editor.post('/api/admin/news').set('Origin', 'http://evil.test').send({})
    expect(res.status).toBe(403)
  })
})
