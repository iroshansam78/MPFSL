import { z } from 'zod'
import { STORY_STATUSES } from '../constants.js'
import { objectId } from './common.js'
import { altText } from './media.js'

const required = (max, message) => z.string().trim().min(1, { error: message }).max(max, { error: `Keep it under ${max} characters` })
const optional = (max) => z.string().trim().max(max, { error: `Keep it under ${max} characters` }).default('')

// Photos that ship with the website (Frontend-v2/public/images/...), used by the imported stories.
export const BUILT_IN_PHOTO = /^\/images\/[a-z0-9/_-]+\.(jpe?g|png|webp)$/

export const storyLink = z.strictObject({
  label: required(80, 'Write the link text'),
  href: z.url({ protocol: /^https?$/, error: 'Enter a full link starting with https://' }).max(500),
})

// "Read more" content: headings, paragraphs and bullet lists ("**Name** rest of the line").
export const storyBlock = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('h4'), text: required(200, 'Write the heading') }),
  z.strictObject({ type: z.literal('p'), text: required(5000, 'Write the paragraph') }),
  z.strictObject({
    type: z.literal('list'),
    items: z
      .array(
        z
          .strictObject({ strong: optional(200), text: optional(1000) })
          .refine((item) => item.strong || item.text, { error: 'Fill in or remove the empty bullet' }),
      )
      .min(1, { error: 'Add at least one bullet' })
      .max(30),
  }),
])

// An uploaded photo (`media`) or one that ships with the website (`src`).
export const storyImage = z
  .strictObject({
    media: objectId.optional(),
    src: z.string().regex(BUILT_IN_PHOTO).optional(),
    alt: altText,
  })
  .refine((image) => Boolean(image.media) !== Boolean(image.src), { error: 'Choose a photo' })

export const storyMilestone = z.strictObject({
  tag: required(60, 'Add the year or event'),
  title: required(150, 'Add a title'),
  body: required(500, 'Add a sentence about it'),
})

// Extras shown while a story is the featured one: the news section's headline, the result box
// over the photo and the milestone cards under it.
export const storyFeature = z
  .strictObject({
    heading: required(200, 'Write the news section’s headline'),
    highlight: optional(100), // word(s) of the headline shown in colour
    meta: optional(200), // small line under the text, e.g. '20th Asian Games · Nagoya, Japan'
    stat: z
      .strictObject({ value: required(12, 'Add the result, e.g. 28th'), label: required(60, 'Add what it means') })
      .nullable()
      .default(null),
    milestones: z.array(storyMilestone).max(6).default([]),
  })
  .refine((feature) => !feature.highlight || feature.heading.includes(feature.highlight), {
    error: 'The coloured words must appear in the headline exactly as written',
    path: ['highlight'],
  })

/** Everything an editor fills in for a story (create and update send the whole story). */
export const newsStoryBody = z.strictObject({
  tag: required(120, 'Add a short tag line, e.g. the event and date'),
  title: required(200, 'Give the story a title'),
  lead: required(2000, 'Write the intro paragraph'),
  body: z.array(storyBlock).max(50).default([]),
  links: z.array(storyLink).max(12).default([]),
  images: z.array(storyImage).min(1, { error: 'Add at least one photo' }).max(4, { error: 'A story can have 4 photos at most' }),
  status: z.enum(STORY_STATUSES).default('draft'),
  feature: storyFeature.nullable().default(null),
})

export const newsStatusBody = z.strictObject({ status: z.enum(STORY_STATUSES) })

export const reorderNewsBody = z.strictObject({ ids: z.array(objectId).min(1).max(1000) })
