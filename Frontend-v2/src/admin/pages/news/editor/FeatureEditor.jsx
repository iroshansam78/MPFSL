import { Plus } from 'lucide-react'
import Button from '../../../components/ui/Button.jsx'
import Field from '../../../components/ui/Field.jsx'
import { Input, Textarea } from '../../../components/ui/Input.jsx'
import ListControls from './ListControls.jsx'
import { moveItem, removeAt, replaceAt } from './listUtils.js'

/**
 * Extras of the featured story: the news section's headline, the result box over the photo, the
 * line under the text and the milestone cards. `feature.stat` is { value, label } (both empty = no box).
 */
function FeatureEditor({ feature, onChange, errors }) {
  const set = (name) => (event) => onChange({ ...feature, [name]: event.target.value })
  const setStat = (name) => (event) => onChange({ ...feature, stat: { ...feature.stat, [name]: event.target.value } })
  const milestones = feature.milestones
  const setMilestones = (next) => onChange({ ...feature, milestones: next })

  return (
    <div className="grid gap-4">
      <Field label="News section headline" hint="The big headline at the top of the news section." error={errors['feature.heading']}>
        {(props) => <Input {...props} value={feature.heading} onChange={set('heading')} maxLength={200} />}
      </Field>
      <Field
        label="Words shown in colour (optional)"
        hint="Copy one or more words from the headline exactly, e.g. Nagoya."
        error={errors['feature.highlight']}
      >
        {(props) => <Input {...props} value={feature.highlight} onChange={set('highlight')} maxLength={100} />}
      </Field>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Field label="Result box: result (optional)" hint="e.g. 28th, Gold, 3 medals" error={errors['feature.stat.value']}>
          {(props) => <Input {...props} value={feature.stat.value} onChange={setStat('value')} maxLength={12} />}
        </Field>
        <Field label="Result box: what it means" hint="e.g. overall in Nagoya" error={errors['feature.stat.label']}>
          {(props) => <Input {...props} value={feature.stat.label} onChange={setStat('label')} maxLength={60} />}
        </Field>
      </div>

      <Field label="Line under the text (optional)" hint="e.g. 20th Asian Games · Nagoya, Japan" error={errors['feature.meta']}>
        {(props) => <Input {...props} value={feature.meta} onChange={set('meta')} maxLength={200} />}
      </Field>

      <div className="grid gap-2">
        <p className="text-sm font-semibold">Milestones (optional)</p>
        <p className="text-xs text-muted">Cards shown under the featured story, e.g. the athlete’s earlier titles. Up to 6.</p>
        {milestones.map((milestone, i) => (
          <div key={i} className="grid gap-2 rounded-lg border border-line bg-bg/40 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold tracking-wide text-muted uppercase">Milestone {i + 1}</p>
              <ListControls
                index={i}
                count={milestones.length}
                label={`milestone ${i + 1}`}
                onMove={(step) => setMilestones(moveItem(milestones, i, step))}
                onRemove={() => setMilestones(removeAt(milestones, i))}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <Input
                value={milestone.tag}
                onChange={(e) => setMilestones(replaceAt(milestones, i, { ...milestone, tag: e.target.value }))}
                placeholder="Year or event, e.g. 2019"
                aria-label={`Milestone ${i + 1}: year or event`}
                aria-invalid={errors[`feature.milestones.${i}.tag`] ? true : undefined}
              />
              <Input
                value={milestone.title}
                onChange={(e) => setMilestones(replaceAt(milestones, i, { ...milestone, title: e.target.value }))}
                placeholder="Title, e.g. National Triathlon Champion"
                aria-label={`Milestone ${i + 1}: title`}
                aria-invalid={errors[`feature.milestones.${i}.title`] ? true : undefined}
              />
            </div>
            <Textarea
              rows={2}
              value={milestone.body}
              onChange={(e) => setMilestones(replaceAt(milestones, i, { ...milestone, body: e.target.value }))}
              placeholder="One sentence about it"
              aria-label={`Milestone ${i + 1}: description`}
              aria-invalid={errors[`feature.milestones.${i}.body`] ? true : undefined}
            />
            {['tag', 'title', 'body'].map(
              (part) =>
                errors[`feature.milestones.${i}.${part}`] && (
                  <p key={part} className="text-sm font-medium text-danger">
                    {errors[`feature.milestones.${i}.${part}`]}
                  </p>
                ),
            )}
          </div>
        ))}
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMilestones([...milestones, { tag: '', title: '', body: '' }])}
            disabled={milestones.length >= 6}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add milestone
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FeatureEditor
