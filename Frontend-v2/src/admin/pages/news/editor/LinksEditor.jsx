import { Plus, X } from 'lucide-react'
import Button from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { removeAt, replaceAt } from './listUtils.js'

const hashtagUrl = (label) => `https://www.facebook.com/hashtag/${label.slice(1).toLowerCase()}`

/** The pill-shaped links under a story (organisations, hashtags). */
function LinksEditor({ links, onChange, errors }) {
  const update = (index, link) => onChange(replaceAt(links, index, link))

  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted">
        For a Facebook hashtag, type it starting with # (e.g. #TeamSriLanka) and the link fills itself in.
      </p>
      {links.map((link, i) => (
        <div key={i} className="grid gap-1">
          <div className="flex items-start gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <Input
                value={link.label}
                onChange={(e) => update(i, { ...link, label: e.target.value })}
                onBlur={() => {
                  const label = link.label.trim()
                  if (/^#\w+$/.test(label) && !link.href.trim()) update(i, { label, href: hashtagUrl(label) })
                }}
                placeholder="Link text, e.g. UIPM or #MPFSL"
                aria-label={`Link ${i + 1}: text`}
                aria-invalid={errors[`links.${i}.label`] ? true : undefined}
              />
              <Input
                type="url"
                value={link.href}
                onChange={(e) => update(i, { ...link, href: e.target.value })}
                placeholder="https://"
                aria-label={`Link ${i + 1}: address`}
                aria-invalid={errors[`links.${i}.href`] ? true : undefined}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(removeAt(links, i))}
              className="mt-1 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
              aria-label={`Remove link ${i + 1}`}
            >
              <X className="size-4" />
            </button>
          </div>
          {(errors[`links.${i}.label`] || errors[`links.${i}.href`]) && (
            <p className="text-sm font-medium text-danger">{errors[`links.${i}.label`] ?? errors[`links.${i}.href`]}</p>
          )}
        </div>
      ))}
      <div>
        <Button variant="secondary" size="sm" onClick={() => onChange([...links, { label: '', href: '' }])} disabled={links.length >= 12}>
          <Plus className="size-4" aria-hidden="true" />
          Add link
        </Button>
      </div>
    </div>
  )
}

export default LinksEditor
