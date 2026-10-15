import { toUserResponse } from './users.mapper.js'
import * as usersService from './users.service.js'

export async function list(_req, res) {
  const users = await usersService.listUsers()
  res.json({ users: users.map(toUserResponse) })
}

export async function create(req, res) {
  const { user, temporaryPassword } = await usersService.createUser(req.valid.body, req.user)
  // The temporary password is shown once to the admin and never stored in plain text.
  res.status(201).json({ user: toUserResponse(user), temporaryPassword })
}

export async function update(req, res) {
  const user = await usersService.updateUser(req.valid.params.id, req.valid.body, req.user)
  res.json({ user: toUserResponse(user) })
}

export async function resetPassword(req, res) {
  const { user, temporaryPassword } = await usersService.resetPassword(req.valid.params.id, req.user)
  res.json({ user: toUserResponse(user), temporaryPassword })
}
