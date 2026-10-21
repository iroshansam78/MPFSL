import { ImageUp } from 'lucide-react'

/**
 * A photo as it sits on the website, clickable to replace it. Fills its parent, which sets the size.
 * @param {{ spot: ReturnType<typeof import('./photoSpots.js').buildSpot>, badge?: string, onClick: () => void, className?: string }} props
 */
function PhotoSpotButton({ spot, badge, onClick, className = '' }) {
  const status = spot.change?.media ? 'New photo' : spot.change ? 'New caption' : null

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative size-full overflow-hidden rounded-lg bg-surface-2 text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none ${className}`}
      aria-label={`${spot.title}: ${spot.alt}. Replace photo or edit caption`}
    >
      <img src={spot.src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />

      {(badge || status) && (
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
          {badge ? (
            <span className="rounded-md bg-black/65 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">{badge}</span>
          ) : (
            <span />
          )}
          {status && <span className="rounded-md bg-brand px-2 py-1 text-xs font-semibold text-on-brand">{status}</span>}
        </div>
      )}

      {/* shown while pointing at / focused on the photo */}
      <div className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black shadow">
          <ImageUp className="size-4" aria-hidden="true" />
          Replace photo
        </span>
      </div>

      <p className="absolute inset-x-0 bottom-0 line-clamp-2 bg-linear-to-t from-black/85 to-transparent p-2 pt-8 text-xs leading-snug text-white sm:text-sm">
        {spot.alt}
      </p>
    </button>
  )
}

export default PhotoSpotButton
