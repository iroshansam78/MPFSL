import { logger } from '../../lib/logger.js'
import { AuditLog } from './audit.model.js'

/**
 * Records an action in the audit log. Never throws: a logging problem must not break the action
 * itself — unless it runs inside a transaction (`session`), where it should succeed or fail together.
 *
 * @param {{
 *   action: string,
 *   user?: { id: string, email?: string } | null,
 *   email?: string,
 *   target?: { type: string, id: string },
 *   details?: Record<string, unknown>,
 *   ip?: string,
 * }} entry
 * @param {import('mongoose').ClientSession} [session]
 */
export async function record(entry, session) {
  const doc = {
    action: entry.action,
    user: entry.user?.id,
    email: entry.user?.email ?? entry.email,
    target: entry.target,
    details: entry.details,
    ip: entry.ip,
  }

  if (session) {
    await AuditLog.create([doc], { session })
    return
  }

  try {
    await AuditLog.create(doc)
  } catch (err) {
    logger.error({ err, action: entry.action }, 'Failed to write audit log')
  }
}
