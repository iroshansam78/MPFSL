import { newsStoryBody } from '@mpfsl/shared'
import { ArrowLeft, Star } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import * as mediaApi from '../../api/media.js'
import { accentFor } from '../../components/news/accents.js'
import { FeaturedPreview, StoryCard } from '../../components/news/StoryPreview.jsx'
import { storyPhotoShape } from '../../components/photos/photoSpots.js'
import ReplacePhotoModal from '../../components/photos/ReplacePhotoModal.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Field from '../../components/ui/Field.jsx'
import { Checkbox, Input, Textarea } from '../../components/ui/Input.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { useSaveStory, useStories, useStory } from '../../hooks/useNews.js'
import { useToast } from '../../hooks/useToast.js'
import BlocksEditor from './editor/BlocksEditor.jsx'
import FeatureEditor from './editor/FeatureEditor.jsx'
import LinksEditor from './editor/LinksEditor.jsx'
import { removeAt, replaceAt } from './editor/listUtils.js'
import PhotosEditor from './editor/PhotosEditor.jsx'

const EMPTY = {
  tag: '',
  title: '',
  lead: '',
  body: [],
  links: [],
  images: [],
  status: 'published',
  feature: null,
}

/** The story as the form edits it. */
function toForm(story) {
  if (!story) return EMPTY
  const feature = story.feature && {
    ...story.feature,
    stat: story.feature.stat ?? { value: '', label: '' },
    milestones: story.feature.milestones.map((m) => ({ ...m })),
  }
  return {
    tag: story.tag,
    title: story.title,
    lead: story.lead,
    body: structuredClone(story.body),
    links: story.links.map((link) => ({ ...link })),
    images: story.images.map((image) => ({
      media: image.media?.id ?? null,
      src: image.src,
      alt: image.alt,
      preview: image.preview,
    })),
    status: story.status,
    feature,
  }
}

/** The form as the API expects it. */
function toPayload(form) {
  const { feature } = form
  const stat = feature?.stat
  return {
    tag: form.tag,
    title: form.title,
    lead: form.lead,
    body: form.body,
    links: form.links,
    images: form.images.map(({ media, src, alt }) => (media ? { media, alt } : { src, alt })),
    status: form.status,
    feature: feature && {
      ...feature,
      stat: stat?.value.trim() || stat?.label.trim() ? stat : null,
    },
  }
}

/** Zod issues → { 'body.2.text': message } (the same keys the server uses). */
function fieldErrors(issues) {
  const errors = {}
  for (const issue of issues) errors[issue.path.join('.')] ??= issue.message
  return errors
}

function NewsEditorPage() {
  const { id } = useParams()
  const { data: story, isPending, error } = useStory(id)

  if (id && isPending) {
    return (
      <div className="grid place-items-center py-16 text-muted">
        <Spinner className="size-7" label="Loading story" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="grid gap-4">
        <Alert tone="error">{error.message}</Alert>
        <BackLink />
      </div>
    )
  }
  return <StoryForm key={story?.id ?? 'new'} story={story ?? null} />
}

function BackLink() {
  return (
    <Link to="/news" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
      <ArrowLeft className="size-4" aria-hidden="true" />
      All stories
    </Link>
  )
}

function StoryForm({ story }) {
  const navigate = useNavigate()
  const toast = useToast()
  const save = useSaveStory()
  const { data: stories } = useStories()
  const [form, setForm] = useState(() => toForm(story))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [editingPhoto, setEditingPhoto] = useState(null) // index; images.length = a new photo
  const uploadedHere = useRef(new Set()) // photos uploaded in this form and not saved yet

  const featured = Boolean(story?.featured)
  const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }))
  const setText = (name) => (event) => set(name)(event.target.value)

  // forget an unsaved upload that's no longer used
  const discardUpload = (mediaId) => {
    if (mediaId && uploadedHere.current.delete(mediaId)) mediaApi.deleteMedia(mediaId).catch(() => {})
  }

  const savePhoto = async ({ file, alt }) => {
    const index = editingPhoto
    const current = form.images[index]
    if (!file) return set('images')(replaceAt(form.images, index, { ...current, alt }))
    const media = await mediaApi.uploadPhoto(file, alt)
    uploadedHere.current.add(media.id)
    discardUpload(current?.media)
    const image = {
      media: media.id,
      src: null,
      alt,
      preview: media.urls.medium,
    }
    set('images')(current ? replaceAt(form.images, index, image) : [...form.images, image])
  }

  const removePhoto = (index) => {
    discardUpload(form.images[index].media)
    set('images')(removeAt(form.images, index))
  }

  const cancel = () => {
    for (const mediaId of [...uploadedHere.current]) discardUpload(mediaId)
    navigate('/news')
  }

  const submit = (event) => {
    event.preventDefault()
    const result = newsStoryBody.safeParse(toPayload(form))
    if (!result.success) {
      setErrors(fieldErrors(result.error.issues))
      setFormError('Some fields need attention: see the messages in red.')
      return
    }
    setErrors({})
    setFormError(null)
    save.mutate(
      { id: story?.id, ...result.data },
      {
        onSuccess: (saved) => {
          uploadedHere.current.clear()
          toast.show({
            tone: 'success',
            message: saved.status === 'published' ? 'Story saved and shown on the website' : 'Story saved as a draft',
          })
          navigate('/news')
        },
        onError: (err) => {
          setErrors(err.fields ?? {})
          setFormError(err.fields ? 'Some fields need attention: see the messages in red.' : err.message)
        },
      },
    )
  }

  // the colour the website will give this story (by its position among the published stories)
  const published = (stories ?? []).filter((s) => !s.featured && s.status === 'published' && s.id !== story?.id)
  const position = story
    ? (stories ?? []).filter((s) => !s.featured && s.status === 'published').findIndex((s) => s.id === story.id)
    : 0
  const accent = form.status === 'published' ? accentFor(position >= 0 ? position : published.length) : null

  const photoCount = form.images.length
  const photoSpot =
    editingPhoto === null
      ? null
      : {
          key: `photo-${editingPhoto}-${form.images[editingPhoto]?.preview ?? 'new'}`,
          title: editingPhoto < photoCount ? `Photo ${editingPhoto + 1} of this story` : 'New photo for this story',
          shape: storyPhotoShape(editingPhoto, editingPhoto < photoCount ? photoCount : photoCount + 1, featured),
          src: form.images[editingPhoto]?.preview ?? null,
          alt: form.images[editingPhoto]?.alt ?? '',
        }

  return (
    <>
      <form onSubmit={submit} noValidate className="grid gap-6">
        <div className="grid gap-3">
          <BackLink />
          <PageHeader
            title={story ? 'Edit story' : 'New story'}
            description={
              story
                ? 'Change anything below, then save. The website updates within a minute.'
                : 'New stories go to the top of “More from the federation”. Their colour is given automatically.'
            }
            actions={
              featured && (
                <Badge tone="brand">
                  <Star className="mr-1 size-3.5" aria-hidden="true" />
                  Featured story
                </Badge>
              )
            }
          />
        </div>

        <Card title="Story">
          <div className="grid gap-4">
            <Field
              label="Tag line"
              hint="Event and date, shown in colour above the title. e.g. Coaching · 27–31 May 2025"
              error={errors.tag}
            >
              {(props) => <Input {...props} value={form.tag} onChange={setText('tag')} maxLength={120} />}
            </Field>
            <Field label="Title" error={errors.title}>
              {(props) => <Input {...props} value={form.title} onChange={setText('title')} maxLength={200} />}
            </Field>
            <Field label="Intro" hint="Always shown. Keep it to two or three sentences." error={errors.lead}>
              {(props) => <Textarea {...props} value={form.lead} onChange={setText('lead')} maxLength={2000} />}
            </Field>
          </div>
        </Card>

        <Card title="Photos" description="One to four photos. Each needs a caption.">
          <PhotosEditor
            images={form.images}
            featured={featured}
            onEdit={setEditingPhoto}
            onRemove={removePhoto}
            error={errors.images ?? Object.entries(errors).find(([key]) => key.startsWith('images.'))?.[1]}
          />
        </Card>

        <Card
          title={featured ? 'More text' : '“Read more” text'}
          description={featured ? 'Shown under the intro.' : 'Shown when visitors click “Read more”.'}
        >
          <BlocksEditor blocks={form.body} onChange={set('body')} errors={errors} />
        </Card>

        <Card title="Links" description="Organisations and hashtags, shown as small buttons under the story.">
          <LinksEditor links={form.links} onChange={set('links')} errors={errors} />
        </Card>

        {featured && form.feature && (
          <Card title="Featured story extras" description="Shown only while this is the featured story.">
            <FeatureEditor feature={form.feature} onChange={set('feature')} errors={errors} />
          </Card>
        )}

        <Card title="Preview" description="How the story looks on the website, in its colours.">
          {featured ? <FeaturedPreview story={form} /> : <StoryCard story={form} accent={accent} dimmed={!accent} />}
          {!accent && !featured && (
            <p className="mt-3 text-sm text-muted">Drafts aren’t on the website, so they get their colour when published.</p>
          )}
        </Card>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <Checkbox
            label="Show on the website"
            checked={form.status === 'published'}
            onChange={(event) => set('status')(event.target.checked ? 'published' : 'draft')}
          />
          {formError && <p className="text-sm font-medium text-danger">{formError}</p>}
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={cancel} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={save.isPending}>
              {form.status === 'published' ? 'Save' : 'Save as draft'}
            </Button>
          </div>
        </div>
      </form>

      {/* outside the story's form: its own form must not submit the story */}
      <ReplacePhotoModal spot={photoSpot} onClose={() => setEditingPhoto(null)} onSave={savePhoto} />
    </>
  )
}

export default NewsEditorPage
