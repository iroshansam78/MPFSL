import { useMemo } from 'react'
import { CanvasTexture, ClampToEdgeWrapping, RepeatWrapping, SRGBColorSpace } from 'three'

// Red running track with 8 numbered lanes and a speckled surface.
function drawTrackCanvas() {
  const size = 1024
  const lanes = 8
  const laneWidth = size / lanes
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#7a2a1f'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 26000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,190,150,0.07)' : 'rgba(0,0,0,0.12)'
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2)
  }

  ctx.fillStyle = '#f4efe6'
  for (let i = 0; i <= lanes; i++) {
    ctx.fillRect(Math.min(size - 8, Math.max(0, i * laneWidth - 4)), 0, 8, size)
  }
  ctx.fillRect(0, size * 0.62, size, 14)
  ctx.font = 'bold 110px "Barlow Condensed", Arial Narrow, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < lanes; i++) {
    ctx.fillText(String(i + 1), i * laneWidth + laneWidth / 2, size * 0.72)
  }

  ctx.fillStyle = '#ffbe29'
  for (let i = 0; i < lanes; i++) {
    ctx.fillRect(i * laneWidth + laneWidth / 2 - 30, size * 0.2, 60, 8)
  }

  return canvas
}

// Track texture that repeats `repeatY` times along its length (scrolled in Track.jsx).
export function useTrackTexture(repeatY) {
  return useMemo(() => {
    const texture = new CanvasTexture(drawTrackCanvas())
    texture.wrapS = ClampToEdgeWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, repeatY)
    texture.anisotropy = 8
    texture.colorSpace = SRGBColorSpace
    return texture
  }, [repeatY])
}

// Soft white radial gradient used for light halos and sprites.
export function useGlowTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 128
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.15, 'rgba(255,236,200,0.6)')
    gradient.addColorStop(1, 'rgba(255,220,170,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
    return new CanvasTexture(canvas)
  }, [])
}
