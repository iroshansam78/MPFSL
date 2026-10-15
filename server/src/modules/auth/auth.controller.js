import { toUserResponse } from '../users/users.mapper.js'
import * as usersService from '../users/users.service.js'
import * as authService from './auth.service.js'
import { clearSessionCookie, setSessionCookie } from './sessionCookie.js'

export async function login(req, res) {
  const { user, session } = await authService.login(req.valid.body, { ip: req.ip, userAgent: req.get('user-agent') })
  setSessionCookie(res, session.token, session)
  res.json({ user: toUserResponse(user) })
}

export async function logout(req, res) {
  await authService.logout(req.authSession.id)
  clearSessionCookie(res)
  res.status(204).end()
}

export async function me(req, res) {
  const user = await usersService.findById(req.user.id)
  res.json({ user: toUserResponse(user) })
}

export async function changePassword(req, res) {
  await authService.changePassword(req.user, req.authSession.id, req.valid.body)
  res.status(204).end()
}
