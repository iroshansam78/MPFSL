import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // storage key, e.g. media/2026/10/<id>/medium.webp
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    bytes: { type: Number, required: true },
  },
  { _id: false },
)

// One uploaded photo. Replaced website photos (site-photos) and later news stories point to these.
const mediaSchema = new mongoose.Schema(
  {
    storage: { type: String, enum: ['r2', 'local'], required: true }, // which driver holds the files
    folder: { type: String, required: true }, // media/<yyyy>/<mm>/<random id>
    variants: {
      thumb: { type: variantSchema, required: true },
      medium: { type: variantSchema, required: true },
      large: { type: variantSchema, required: true },
    },
    alt: { type: String, required: true, trim: true },
    originalName: { type: String, trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

mediaSchema.index({ createdAt: -1 })

export const Media = mongoose.model('Media', mediaSchema)
