import { Heading, List, Pilcrow, Plus, X } from 'lucide-react'
import Button from '../../../components/ui/Button.jsx'
import { Input, Textarea } from '../../../components/ui/Input.jsx'
import ListControls from './ListControls.jsx'
import { moveItem, removeAt, replaceAt } from './listUtils.js'

const TYPES = {
  h4: { label: 'Heading', icon: Heading },
  p: { label: 'Paragraph', icon: Pilcrow },
  list: { label: 'Bullet list', icon: List },
}

const NEW_BLOCK = {
  h4: () => ({ type: 'h4', text: '' }),
  p: () => ({ type: 'p', text: '' }),
  list: () => ({ type: 'list', items: [{ strong: '', text: '' }] }),
}

const ErrorText = ({ children }) => (children ? <p className="text-sm font-medium text-danger">{children}</p> : null)

/**
 * The "Read more" part of a story: headings, paragraphs and bullet lists.
 * `errors` are keyed like the server's: 'body.2.text', 'body.3.items.0'.
 */
function BlocksEditor({ blocks, onChange, errors }) {
  const update = (index, block) => onChange(replaceAt(blocks, index, block))

  return (
    <div className="grid gap-3">
      {blocks.length === 0 && (
        <p className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-muted">
          Nothing here yet. Stories without extra text show just the intro, with no “Read more” button.
        </p>
      )}

      {blocks.map((block, index) => {
        const { label, icon: Icon } = TYPES[block.type]
        const path = `body.${index}`
        return (
          <div key={index} className="grid gap-2 rounded-lg border border-line bg-bg/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-muted uppercase">
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </p>
              <ListControls
                index={index}
                count={blocks.length}
                label={label.toLowerCase()}
                onMove={(step) => onChange(moveItem(blocks, index, step))}
                onRemove={() => onChange(removeAt(blocks, index))}
              />
            </div>

            {block.type === 'h4' && (
              <>
                <Input
                  value={block.text}
                  onChange={(e) => update(index, { ...block, text: e.target.value })}
                  placeholder="e.g. With thanks to our partners"
                  aria-label="Heading"
                  aria-invalid={errors[`${path}.text`] ? true : undefined}
                />
                <ErrorText>{errors[`${path}.text`]}</ErrorText>
              </>
            )}

            {block.type === 'p' && (
              <>
                <Textarea
                  value={block.text}
                  onChange={(e) => update(index, { ...block, text: e.target.value })}
                  aria-label="Paragraph"
                  aria-invalid={errors[`${path}.text`] ? true : undefined}
                />
                <ErrorText>{errors[`${path}.text`]}</ErrorText>
              </>
            )}

            {block.type === 'list' && (
              <div className="grid gap-2">
                <p className="text-xs text-muted">The first part of each bullet is shown in bold (e.g. a name), the rest normally.</p>
                {block.items.map((item, i) => (
                  <div key={i} className="grid gap-1">
                    <div className="flex items-start gap-2">
                      <span className="mt-3 size-1.5 shrink-0 rounded-full bg-muted" aria-hidden="true" />
                      <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,5fr)]">
                        <Input
                          value={item.strong}
                          onChange={(e) => update(index, { ...block, items: replaceAt(block.items, i, { ...item, strong: e.target.value }) })}
                          placeholder="Bold part (optional)"
                          aria-label={`Bullet ${i + 1}: bold part`}
                          className="font-semibold"
                        />
                        <Input
                          value={item.text}
                          onChange={(e) => update(index, { ...block, items: replaceAt(block.items, i, { ...item, text: e.target.value }) })}
                          placeholder="Rest of the line"
                          aria-label={`Bullet ${i + 1}: text`}
                          aria-invalid={errors[`${path}.items.${i}`] ? true : undefined}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => update(index, { ...block, items: removeAt(block.items, i) })}
                        className="mt-1 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
                        aria-label={`Remove bullet ${i + 1}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <ErrorText>{errors[`${path}.items.${i}`]}</ErrorText>
                  </div>
                ))}
                <ErrorText>{errors[`${path}.items`]}</ErrorText>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => update(index, { ...block, items: [...block.items, { strong: '', text: '' }] })}
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add bullet
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPES).map(([type, { label, icon: Icon }]) => (
          <Button key={type} variant="secondary" size="sm" onClick={() => onChange([...blocks, NEW_BLOCK[type]()])}>
            <Icon className="size-4" aria-hidden="true" />
            Add {label.toLowerCase()}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default BlocksEditor
