// The only place that decides which user fields leave the API. Never send a raw User document.

/** For the admin "Users" page and /auth/me */
export function toUserResponse(user) {
  return {
    id: String(user._id ?? user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
    mustChangePassword: Boolean(user.mustChangePassword),
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
  }
}
