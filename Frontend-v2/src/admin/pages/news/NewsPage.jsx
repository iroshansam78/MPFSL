import { ArrowDown, ArrowUp, Eye, EyeOff, ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { accentFor, ACCENTS } from '../../components/news/accents.js'
import { FeaturedPreview, StoryCard } from '../../components/news/StoryPreview.jsx'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { useDeleteStory, useFeatureStory, useReorderStories, useSetStoryStatus, useStories } from '../../hooks/useNews.js'
import { useToast } from '../../hooks/useToast.js'
import { PUBLIC_SITE_URL } from '../../lib/config.js'

/** The news section as the website shows it, with the actions for each story. */
function NewsPage() {
  const { data: stories, isPending, error } = useStories()
  const setStatus = useSetStoryStatus()
  const feature = useFeatureStory()
  const reorder = useReorderStories()
  const remove = useDeleteStory()
  const toast = useToast()
  const [deleting, setDeleting] = useState(null)

  const featured = stories?.find((story) => story.featured) ?? null
  const others = stories?.filter((story) => !story.featured) ?? []

  // colours follow the position among the stories the website shows (drafts are skipped)
  const accents = new Map()
  others.filter((story) => story.status === 'published').forEach((story, i) => accents.set(story.id, accentFor(i)))

  const fail = (err) => toast.show({ tone: 'error', message: err.message })

  const togglePublished = (story) =>
    setStatus.mutate(
      { id: story.id, status: story.status === 'published' ? 'draft' : 'published' },
      {
        onSuccess: () =>
          toast.show({ tone: 'success', message: story.status === 'published' ? 'Taken off the website' : 'Published on the website' }),
        onError: fail,
      },
    )

  const move = (index, step) => {
    const next = [...others]
    ;[next[index], next[index + step]] = [next[index + step], next[index]]
    reorder.mutate(featured ? [featured, ...next] : next, { onError: fail })
  }

  const makeFeatured = (story) =>
    feature.mutate(story.id, {
      onSuccess: () => toast.show({ tone: 'success', message: 'Now the featured story. Check its headline and result box.' }),
      onError: fail,
    })

  const confirmDelete = () =>
    remove.mutate(deleting.id, {
      onSuccess: () => {
        setDeleting(null)
        toast.show({ tone: 'success', message: 'Story deleted' })
      },
      onError: (err) => {
        setDeleting(null)
        fail(err)
      },
    })

  return (
    <>
      <PageHeader
        title="News"
        description="The news section as it appears on the website. Changes show on the website within a minute."
        actions={
          <>
            <Button variant="secondary" onClick={() => window.open(`${PUBLIC_SITE_URL}/#news`, '_blank', 'noopener')}>
              <ExternalLink className="size-4" aria-hidden="true" />
              View on website
            </Button>
            <Link
              to="/news/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand hover:bg-brand-hover"
            >
              <Plus className="size-4" aria-hidden="true" />
              New story
            </Link>
          </>
        }
      />

      {isPending && (
        <div className="grid place-items-center py-16 text-muted">
          <Spinner className="size-7" label="Loading stories" />
        </div>
      )}
      {error && <Alert tone="error">{error.message}</Alert>}

      {stories && (
        <div className="grid gap-10">
          <section aria-labelledby="featured-heading" className="grid gap-3">
            <h2 id="featured-heading" className="font-display text-2xl font-extrabold uppercase">
              Featured story
            </h2>
            {featured ? (
              <FeaturedPreview story={featured}>
                {featured.status !== 'published' && (
                  <Alert tone="warning">This story is a draft, so the website shows no featured story. Publish it to show it.</Alert>
                )}
                <Actions>
                  <EditLink story={featured} />
                  <PublishButton story={featured} onClick={() => togglePublished(featured)} />
                  <DeleteButton onClick={() => setDeleting(featured)} />
                </Actions>
              </FeaturedPreview>
            ) : (
              <Alert tone="info">No featured story. Use “Make featured” on one of the stories below.</Alert>
            )}
          </section>

          <section aria-labelledby="stories-heading" className="grid gap-3">
            <div className="grid gap-1">
              <h2 id="stories-heading" className="font-display text-2xl font-extrabold uppercase">
                More from the federation
              </h2>
              <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
                Colours are given automatically in the website’s order:
                {ACCENTS.map((accent) => (
                  <span key={accent.name} className="inline-flex items-center gap-1">
                    <span className={`size-2.5 rounded-full ${accent.dot}`} aria-hidden="true" />
                    {accent.name}
                  </span>
                ))}
              </p>
            </div>

            {others.length === 0 && <Alert tone="info">No stories yet. Use “New story” to write one.</Alert>}

            {others.map((story, index) => (
              <StoryCard key={story.id} story={story} accent={accents.get(story.id) ?? null} dimmed={story.status !== 'published'}>
                <Actions>
                  {story.status !== 'published' && <Badge tone="warning">Draft · not on the website</Badge>}
                  <EditLink story={story} />
                  <PublishButton story={story} onClick={() => togglePublished(story)} />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => makeFeatured(story)}
                    disabled={story.status !== 'published' || feature.isPending}
                    title={story.status !== 'published' ? 'Publish the story first' : undefined}
                  >
                    <Star className="size-4" aria-hidden="true" />
                    Make featured
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => move(index, -1)} disabled={index === 0 || reorder.isPending} aria-label={`Move “${story.title}” up`}>
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => move(index, 1)}
                    disabled={index === others.length - 1 || reorder.isPending}
                    aria-label={`Move “${story.title}” down`}
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </Button>
                  <DeleteButton onClick={() => setDeleting(story)} />
                </Actions>
              </StoryCard>
            ))}
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete story?"
        confirmLabel="Delete"
        tone="danger"
        loading={remove.isPending}
      >
        “{deleting?.title}” is removed from the website for good, with the photos uploaded for it. To keep it but hide it, use
        Unpublish instead.
      </ConfirmDialog>
    </>
  )
}

function Actions({ children }) {
  return <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">{children}</div>
}

function EditLink({ story }) {
  return (
    <Link
      to={`/news/${story.id}`}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-on-brand hover:bg-brand-hover"
    >
      <Pencil className="size-4" aria-hidden="true" />
      Edit
    </Link>
  )
}

function PublishButton({ story, onClick }) {
  const published = story.status === 'published'
  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      {published ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      {published ? 'Unpublish' : 'Publish'}
    </Button>
  )
}

function DeleteButton({ onClick }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="ml-auto text-danger">
      <Trash2 className="size-4" aria-hidden="true" />
      Delete
    </Button>
  )
}

export default NewsPage
