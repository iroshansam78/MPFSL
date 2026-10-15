import mongoose from 'mongoose'

// Who did what and when: logins, failed logins, account changes, publishes, deletions.
const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. 'auth.login', 'user.create', 'news.publish'
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who did it (missing for failed logins)
    email: { type: String }, // kept even if the user is later renamed / for failed logins
    target: {
      type: { type: String }, // e.g. 'user', 'news'
      id: { type: String },
    },
    details: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
)

auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ 'target.type': 1, 'target.id': 1, createdAt: -1 })

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)
