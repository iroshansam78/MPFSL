import { mediaUrls, toMediaResponse } from '../media/media.mapper.js'

const plain = (doc) => (doc?.toObject ? doc.toObject() : doc)

const featureOf = (story) => {
  const feature = plain(story.feature)
  if (!feature) return null
  return {
    heading: feature.heading,
    highlight: feature.highlight ?? '',
    meta: feature.meta ?? '',
    stat: feature.stat?.value ? { value: feature.stat.value, label: feature.stat.label } : null,
    milestones: (feature.milestones ?? []).map(({ tag, title, body }) => ({ tag, title, body })),
  }
}

const textOf = (story) => ({
  tag: story.tag,
  title: story.title,
  lead: story.lead,
  body: plain(story.body) ?? [],
  links: (story.links ?? []).map(({ label, href }) => ({ label, href })),
})

/** A photo for the website: uploaded ones in their sizes, built-in ones as they are. */
function publicImage(image) {
  if (image.src) return { src: image.src, alt: image.alt }
  if (!image.media) return null // the uploaded file was deleted
  const urls = mediaUrls(image.media)
  return { src: urls.medium, large: urls.large, alt: image.alt }
}

/** For the website. */
export function toPublicStory(story) {
  return {
    id: String(story._id),
    ...textOf(story),
    images: story.images.map(publicImage).filter(Boolean),
    ...(story.featured && { feature: featureOf(story) }),
  }
}

/** For the admin panel: everything needed to edit the story, plus a preview URL per photo. */
export function toAdminStory(story) {
  return {
    id: String(story._id),
    status: story.status,
    featured: story.featured,
    order: story.order,
    ...textOf(story),
    images: story.images.map((image) => ({
      alt: image.alt,
      src: image.src ?? null,
      media: image.media ? toMediaResponse(image.media) : null,
      preview: image.src ?? (image.media ? mediaUrls(image.media).medium : null),
    })),
    feature: featureOf(story),
    publishedAt: story.publishedAt ?? null,
    updatedAt: story.updatedAt,
  }
}
