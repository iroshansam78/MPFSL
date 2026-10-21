import mongoose from 'mongoose'
import { STORY_STATUSES } from '@mpfsl/shared'

const { ObjectId } = mongoose.Schema.Types

// Blocks of the "Read more" part: { type: 'h4' | 'p', text } or { type: 'list', items: [{ strong, text }] }.
// Validated by newsStoryBody (shared/) before saving, so stored as plain objects here.
const imageSchema = new mongoose.Schema(
  {
    media: { type: ObjectId, ref: 'Media' }, // an uploaded photo...
    src: String, // ...or one that ships with the website (/images/news/...)
    alt: { type: String, required: true },
  },
  { _id: false },
)

const featureSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    highlight: String,
    meta: String,
    stat: { type: new mongoose.Schema({ value: String, label: String }, { _id: false }), default: null },
    milestones: { type: [new mongoose.Schema({ tag: String, title: String, body: String }, { _id: false })], default: [] },
  },
  { _id: false },
)

// A news story. The website shows the `featured` one at the top of the news section (with the
// `feature` extras) and the other published stories under it, in `order`.
const newsStorySchema = new mongoose.Schema(
  {
    tag: { type: String, required: true },
    title: { type: String, required: true },
    lead: { type: String, required: true },
    body: { type: [mongoose.Schema.Types.Mixed], default: [] },
    links: { type: [new mongoose.Schema({ label: String, href: String }, { _id: false })], default: [] },
    images: { type: [imageSchema], default: [] },
    status: { type: String, enum: STORY_STATUSES, default: 'draft' },
    featured: { type: Boolean, default: false },
    feature: { type: featureSchema, default: null },
    order: { type: Number, required: true },
    publishedAt: Date,
    createdBy: { type: ObjectId, ref: 'User' },
    updatedBy: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

newsStorySchema.index({ status: 1, order: 1 })
newsStorySchema.index({ 'images.media': 1 })

export const NewsStory = mongoose.model('NewsStory', newsStorySchema)
