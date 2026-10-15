import mongoose from 'mongoose'

// One document per logged-in browser. The cookie holds a random token; only its keyed hash is
// stored here, so a copy of the database can't be used to log in.
const sessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rememberMe: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    lastSeenAt: { type: Date, required: true },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
)

// MongoDB deletes expired sessions automatically.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Session = mongoose.model('Session', sessionSchema)
