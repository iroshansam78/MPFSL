# Hero slideshow images (optional)

The hero slideshow can use the federation's own photos instead of the Unsplash ones:

- `hero/<key>.jpg`  – the photo
- `depth/<key>.png` – a greyscale depth map of the same photo (white = near, black = far)

`<key>` is one of: `fencing`, `swimming`, `obstacle`, `running`. After adding the files, **add the key
to `localPhotos` in `src/data/hero.js`**; until then the site doesn't request them (so there are no
404 errors in the browser console).

If a photo is missing, the slideshow uses the Unsplash photo for that discipline instead.
If only the depth map is missing, the photo still shows, with a plain pan instead of the
3D parallax effect.
