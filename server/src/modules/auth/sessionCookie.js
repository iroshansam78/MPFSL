import { isProduction } from '../../config/env.js'

// In production the "__Host-" prefix makes browsers enforce Secure, Path=/ and no Domain,
// so the cookie can only ever belong to api.website.lk over HTTPS.
export const SESSION_COOKIE = isProduction ? '__Host-mpfsl_session' : 'mpfsl_session'

const baseOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
})

/**
 * "Remember me" sessions survive closing the browser; normal ones end with the browser session
 * (and after SESSION_TTL_HOURS of inactivity on the server).
 */
export function setSessionCookie(res, token, { expiresAt, rememberMe }) {
  res.cookie(SESSION_COOKIE, token, {
    ...baseOptions(),
    ...(rememberMe && { expires: expiresAt }),
  })
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, baseOptions())
}
