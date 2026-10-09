// Generates a small random-noise tile once and exposes it as the --grain CSS variable
// (used by the body::after overlay in global.css).
export function applyFilmGrain(size = 160) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(size, size)

  for (let i = 0; i < image.data.length; i += 4) {
    const value = Math.random() * 255
    image.data[i] = image.data[i + 1] = image.data[i + 2] = value
    image.data[i + 3] = 255
  }

  ctx.putImageData(image, 0, 0)
  document.documentElement.style.setProperty('--grain', `url(${canvas.toDataURL()})`)
}
