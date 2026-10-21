import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'

/** Move up / move down / remove buttons for one item of a list. */
function ListControls({ index, count, onMove, onRemove, label }) {
  const button = 'rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent'
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" className={button} onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" className={button} onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move ${label} down`}>
        <ArrowDown className="size-4" />
      </button>
      <button type="button" className={`${button} hover:text-danger`} onClick={onRemove} aria-label={`Remove ${label}`}>
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}

export default ListControls
