import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { gallery } from '../../../data/gallery.js'
import { galleryPhotoKey } from '../../../data/photoSpots.js'
import PhotoSpotButton from '../../components/photos/PhotoSpotButton.jsx'
import { buildSpot } from '../../components/photos/photoSpots.js'
import ReplacePhotoModal from '../../components/photos/ReplacePhotoModal.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { useRestoreSitePhoto, useSitePhotos, useUpdateSitePhoto } from '../../hooks/useSitePhotos.js'
import { useToast } from '../../hooks/useToast.js'
import { PUBLIC_SITE_URL } from '../../lib/config.js'

// Same layout as the website's gallery: 'wide' spans two columns, 'tall' two rows.
const SPANS = {
  normal: '',
  wide: 'md:col-span-2',
  tall: 'md:row-span-2',
}

function GalleryPage() {
  const { data: changes, isPending, error } = useSitePhotos()
  const update = useUpdateSitePhoto()
  const restore = useRestoreSitePhoto()
  const toast = useToast()
  const [editingKey, setEditingKey] = useState(null)

  const spots = gallery.images.map((original, index) => ({
    size: original.size ?? 'normal',
    ...buildSpot(
      { key: galleryPhotoKey(index), title: `Photo ${index + 1} in the gallery`, shape: `gallery-${original.size ?? 'normal'}`, original },
      changes,
    ),
  }))
  const editing = spots.find((spot) => spot.key === editingKey) ?? null

  return (
    <>
      <PageHeader
        title="Gallery"
        description="The gallery exactly as it appears on the website. Click a photo to replace it or change its caption. Changes show on the website within a minute."
        actions={
          <Button variant="secondary" onClick={() => window.open(`${PUBLIC_SITE_URL}/#gallery`, '_blank', 'noopener')}>
            <ExternalLink className="size-4" aria-hidden="true" />
            View on website
          </Button>
        }
      />

      {isPending && (
        <div className="grid place-items-center py-16 text-muted">
          <Spinner className="size-7" label="Loading gallery" />
        </div>
      )}
      {error && <Alert tone="error">{error.message}</Alert>}

      {changes && (
        <ul
          className="grid auto-rows-50 grid-cols-1 gap-3 md:auto-rows-45 md:grid-cols-2 lg:auto-rows-42.5 lg:grid-cols-3"
          aria-label="Gallery photos"
        >
          {spots.map((spot, index) => (
            <li key={spot.key} className={SPANS[spot.size]}>
              <PhotoSpotButton
                spot={spot}
                badge={`${index + 1} · ${spot.shape.label}`}
                onClick={() => setEditingKey(spot.key)}
                className="border border-line"
              />
            </li>
          ))}
        </ul>
      )}

      <ReplacePhotoModal
        spot={editing}
        onClose={() => setEditingKey(null)}
        onSave={async ({ file, alt }) => {
          await update.mutateAsync({ key: editing.key, file, alt })
          toast.show({ tone: 'success', message: file ? 'Photo replaced' : 'Caption updated' })
        }}
        onRestore={
          editing?.change
            ? async () => {
                await restore.mutateAsync(editing.key)
                toast.show({ tone: 'success', message: 'Original photo restored' })
              }
            : undefined
        }
        restoreNote={
          editing &&
          `The website will show the original photo again, with its caption “${editing.original.alt}”.${
            editing.change?.media ? ' The photo you uploaded for this spot is deleted.' : ''
          }`
        }
      />
    </>
  )
}

export default GalleryPage
