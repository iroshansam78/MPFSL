import mongoose from 'mongoose'
import { ROLES } from '@mpfsl/shared'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    // Never returned by queries unless explicitly asked for with .select('+passwordHash')
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'editor', required: true },
    active: { type: Boolean, default: true },
    // Set for new accounts and password resets: the user must choose their own password first
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    // Brute-force protection: too many wrong passwords lock the account for a while
    failedLogins: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
)

userSchema.index({ role: 1, active: 1 })

export const User = mongoose.model('User', userSchema)
