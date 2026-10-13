import { DataTexture, LinearFilter, TextureLoader } from 'three'

// 1×1 mid-grey texture used when a slide has no depth map (and before textures arrive).
export const flatTexture = (() => {
  const texture = new DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1)
  texture.needsUpdate = true
  return texture
})()

const loader = new TextureLoader()
loader.setCrossOrigin('anonymous')

// Resolves to the texture, or null if the URL is empty or fails to load.
const loadTexture = (url) =>
  new Promise((resolve) => {
    if (!url) return resolve(null)
    loader.load(url, resolve, undefined, () => resolve(null))
  })

const prepare = (texture) => {
  texture.minFilter = LinearFilter
  texture.generateMipmaps = false
  return texture
}

/*
 * Loads every slide's photo (+ depth map if present). If the local photo is missing, the slide's
 * `remote` photo is used without depth. Slides that fail completely are dropped.
 */
export async function loadSlides(slides) {
  const loaded = await Promise.all(
    slides.map(async (slide) => {
      let [image, depth] = await Promise.all([loadTexture(slide.src), loadTexture(slide.depth)])
      if (!image && slide.remote) {
        image = await loadTexture(slide.remote)
        depth = null
      }
      if (!image) return null

      prepare(image)
      if (depth) prepare(depth)
      return {
        ...slide,
        img: image,
        dep: depth || flatTexture,
        aspect: image.image.width / image.image.height,
        hasDepth: depth ? 1 : 0,
      }
    }),
  )
  return loaded.filter(Boolean)
}
