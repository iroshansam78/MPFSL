# Hero slideshow images (optional)

The hero slideshow looks for these files first:

- `hero/<key>.jpg`  – the photo
- `depth/<key>.png` – a greyscale depth map of the same photo (white = near, black = far)

`<key>` is one of: `fencing`, `swimming`, `obstacle`, `running` (see `src/data/hero.js`).

If a photo is missing, the slideshow uses the Unsplash photo for that discipline instead.
If only the depth map is missing, the photo still shows, with a plain pan instead of the
3D parallax effect.
