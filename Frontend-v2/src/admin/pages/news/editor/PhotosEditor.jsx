import { ImagePlus, X } from 'lucide-react'
import PhotoSpotButton from '../../../components/photos/PhotoSpotButton.jsx'
import { cssAspect, storyPhotoShape } from '../../../components/photos/photoSpots.js'

/**
 * A story's 1–4 photos, laid out like the website. Clicking one opens the replace window
 * (handled by the page through `onEdit(index)`; index = images.length for a new photo).
 */
function PhotosEditor({ images, featured, onEdit, onRemove, error }) {
  const count = images.length
  const twoColumns = featured ? false : count > 1

  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted">
        {featured
          ? 'The featured story shows its first photo, large, next to the text. Extra photos are kept for when it’s a normal story again.'
          : 'One photo is shown large; two to four are shown in two columns. Click a photo to replace it or change its caption.'}
      </p>
      <div className={`grid gap-2 ${twoColumns ? 'grid-cols-2' : 'max-w-xl'}`}>
        {images.map((image, index) => {
          const shape = storyPhotoShape(index, count, featured)
          return (
            <div key={index} className="relative" style={{ aspectRatio: cssAspect(shape) }}>
              <PhotoSpotButton
                spot={{ key: `photo-${index}`, title: `Photo ${index + 1}`, shape, src: image.preview, alt: image.alt }}
                badge={featured && index > 0 ? `${index + 1} · not shown while featured` : `${index + 1}`}
                onClick={() => onEdit(index)}
                className="border border-line"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 rounded-md bg-black/65 p-1.5 text-white backdrop-blur-sm hover:bg-red-600"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
        {count < 4 && (
          <button
            type="button"
            onClick={() => onEdit(count)}
            className="grid place-items-center content-center gap-2 rounded-lg border-2 border-dashed border-line p-4 text-sm font-semibold text-muted hover:border-brand hover:text-brand"
            style={{ aspectRatio: cssAspect(storyPhotoShape(count, count + 1, featured)) }}
          >
            <ImagePlus className="size-7" aria-hidden="true" />
            Add photo
          </button>
        )}
      </div>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </div>
  )
}

export default PhotosEditor
