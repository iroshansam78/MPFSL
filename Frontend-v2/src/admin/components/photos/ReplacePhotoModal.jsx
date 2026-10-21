import { ImagePlus, ImageUp, RotateCcw, Undo2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Alert from '../ui/Alert.jsx'
import Button from '../ui/Button.jsx'
import Field from '../ui/Field.jsx'
import { Input } from '../ui/Input.jsx'
import Modal from '../ui/Modal.jsx'
import { ACCEPTED_TYPES, cssAspect, fileProblem, MAX_MB, photoWarnings, ratioLabel } from './photoSpots.js'

const captionError = (alt) => {
  const length = alt.trim().length
  if (length < 3) return 'Describe the photo in a few words'
  if (length > 300) return 'Keep it under 300 characters'
  return null
}

/**
 * Pick a photo for one spot on the website (with advice for that spot) and write its caption.
 *
 * - `spot`: { key, title, shape, src, alt } — `src` null for an empty spot (a photo must be picked)
 * - `onSave({ file, alt })`: async; `file` is null when only the caption changed. Throw to show an error.
 * - `onRestore()` (optional): async; offers "Restore original", explained by `restoreNote`.
 */
function ReplacePhotoModal({ spot, onClose, onSave, onRestore, restoreNote }) {
  return (
    <Modal
      open={Boolean(spot)}
      onClose={onClose}
      size="lg"
      title={spot?.src ? 'Replace photo' : 'Add photo'}
      description={spot ? `${spot.title} · ${spot.shape.label} spot` : undefined}
    >
      {/* keyed so the form starts fresh for each spot */}
      {spot && (
        <ReplaceForm key={spot.key} spot={spot} onClose={onClose} onSave={onSave} onRestore={onRestore} restoreNote={restoreNote} />
      )}
    </Modal>
  )
}

function ReplaceForm({ spot, onClose, onSave, onRestore, restoreNote }) {
  const fileInput = useRef(null)
  const [picked, setPicked] = useState(null) // { file, preview, width, height }
  const [fileError, setFileError] = useState(null)
  const [alt, setAlt] = useState(spot.alt ?? '')
  const [showErrors, setShowErrors] = useState(false)
  const [formError, setFormError] = useState(null)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(null) // 'save' | 'restore'

  // free the preview when it's replaced or the window closes
  useEffect(() => () => picked && URL.revokeObjectURL(picked.preview), [picked])

  const pickFile = (file) => {
    if (!file) return
    const problem = fileProblem(file)
    setFileError(problem)
    if (problem) return
    const preview = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => setPicked({ file, preview, width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => {
      URL.revokeObjectURL(preview)
      setFileError('This photo can’t be opened. Try saving it as JPEG first.')
      setAlt((current) => current || spot.alt || '')
    }
    image.src = preview
    // a new caption is needed for a new photo, unless the admin already typed one
    if (alt === spot.alt) setAlt('')
  }

  const undoPick = () => {
    setPicked(null)
    setFileError(null)
    if (!alt.trim()) setAlt(spot.alt ?? '')
  }

  const altError = captionError(alt)
  const needsFile = !spot.src && !picked
  const unchanged = !picked && alt.trim() === (spot.alt ?? '')

  const run = async (kind, action) => {
    setBusy(kind)
    setFormError(null)
    try {
      await action()
      onClose()
    } catch (err) {
      setFormError(err.message)
      setConfirmRestore(false)
    } finally {
      setBusy(null)
    }
  }

  const submit = (event) => {
    event.preventDefault()
    setShowErrors(true)
    if (needsFile) return setFileError('Choose a photo first')
    if (altError || unchanged) return
    run('save', () => onSave({ file: picked?.file ?? null, alt: alt.trim() }))
  }

  const warnings = picked ? photoWarnings(picked, spot.shape) : []
  const { shape } = spot
  const spotRatio = shape.aspect[0] / shape.aspect[1]
  const previewWidth = spotRatio < 1 ? 'max-w-xs' : spotRatio === 1 ? 'max-w-sm' : ''
  const previewSrc = picked?.preview ?? spot.src

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      {formError && <Alert tone="error">{formError}</Alert>}

      <Alert tone="info" title={`What fits this spot: ${shape.photo.toLowerCase()}`}>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>
            Shape about {ratioLabel(shape)}, at least {shape.minWidth} × {shape.minHeight} px
          </li>
          <li>JPEG, PNG or WebP, up to {MAX_MB} MB</li>
          <li>Keep the main subject in the middle: the website crops the edges to fit the spot</li>
          {shape.tip && <li>{shape.tip}</li>}
        </ul>
      </Alert>

      {/* preview in the spot's shape, the way the website crops it */}
      <div className="grid gap-2">
        <p className="text-sm font-semibold">
          {picked ? 'New photo, as it will look on the website' : previewSrc ? 'Current photo' : 'Photo'}
        </p>
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragOver(false)
            pickFile(event.dataTransfer.files[0])
          }}
          className={`relative mx-auto w-full overflow-hidden rounded-lg bg-surface-2 ${previewWidth} ${
            dragOver ? 'ring-2 ring-brand ring-offset-2 ring-offset-surface' : ''
          }`}
          style={{ aspectRatio: cssAspect(shape) }}
        >
          {previewSrc ? (
            <>
              <img src={previewSrc} alt="" className="size-full object-cover" />
              <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 pt-8 text-sm text-white">
                {alt.trim() || 'Caption'}
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current.click()}
              className="grid size-full place-items-center content-center gap-2 border-2 border-dashed border-line text-sm text-muted hover:border-brand"
            >
              <ImagePlus className="size-8" aria-hidden="true" />
              Drop a photo here, or click to choose one
            </button>
          )}
          {dragOver && (
            <div className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-semibold text-white">
              Drop the photo to use it here
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => fileInput.current.click()} disabled={Boolean(busy)}>
            <ImageUp className="size-4" aria-hidden="true" />
            {picked ? 'Choose a different photo' : spot.src ? 'Choose new photo' : 'Choose photo'}
          </Button>
          {picked && spot.src && (
            <Button variant="ghost" size="sm" onClick={undoPick} disabled={Boolean(busy)}>
              <Undo2 className="size-4" aria-hidden="true" />
              Keep the current photo
            </Button>
          )}
          <span className="text-xs text-muted">
            {picked ? `${picked.file.name} · ${picked.width} × ${picked.height} px` : 'or drop a photo on the preview'}
          </span>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              pickFile(event.target.files[0])
              event.target.value = '' // allow picking the same file again
            }}
          />
        </div>

        {fileError && <Alert tone="error">{fileError}</Alert>}
        {warnings.length > 0 && (
          <Alert tone="warning" title="This photo will work, but it may not look its best">
            <ul className="list-disc space-y-0.5 pl-4">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}
      </div>

      <Field
        label="Caption"
        hint="Describes the photo for blind visitors and search engines (the gallery also shows it on the photo)."
        error={showErrors ? altError : null}
      >
        {(props) => (
          <Input
            {...props}
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="e.g. Swimmers at the start of the 200m freestyle"
            maxLength={300}
            disabled={Boolean(busy)}
          />
        )}
      </Field>

      {confirmRestore ? (
        <Alert tone="warning" title="Put the original photo back?">
          <p>{restoreNote}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="danger" size="sm" onClick={() => run('restore', onRestore)} loading={busy === 'restore'}>
              Restore original
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirmRestore(false)} disabled={Boolean(busy)}>
              Keep my changes
            </Button>
          </div>
        </Alert>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {onRestore && (
            <Button variant="ghost" onClick={() => setConfirmRestore(true)} disabled={Boolean(busy)} className="mr-auto">
              <RotateCcw className="size-4" aria-hidden="true" />
              Restore original
            </Button>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onClose} disabled={Boolean(busy)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy === 'save'} disabled={(unchanged && !needsFile) || busy === 'restore'}>
              {picked ? (spot.src ? 'Replace photo' : 'Add photo') : 'Save caption'}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

export default ReplacePhotoModal
