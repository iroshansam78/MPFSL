import mongoose from 'mongoose'

// A change to one of the website's photo spots (a gallery tile, a news story's photo, ...), by the
// spot's name, e.g. 'gallery.0' or 'news.bali-2023.0'. Spots without a document show their
// original photo and caption (built into the website).
const sitePhotoSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    alt: { type: String, trim: true, required: true }, // the caption
    media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' }, // unset = keep the original photo
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

sitePhotoSchema.index({ key: 1 }, { unique: true })
sitePhotoSchema.index({ media: 1 })

export const SitePhoto = mongoose.model('SitePhoto', sitePhotoSchema)
