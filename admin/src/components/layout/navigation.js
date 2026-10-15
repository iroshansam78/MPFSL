import { FolderOpen, Images, LayoutDashboard, Newspaper, UserCog, Users } from 'lucide-react'

/**
 * Sidebar items. `adminOnly` hides an item from editors (the API enforces this too).
 * `soon` marks screens waiting for their API (Phases 2–3); they open a placeholder page.
 */
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/news', label: 'News', icon: Newspaper, soon: true },
  { to: '/gallery', label: 'Gallery', icon: Images, soon: true },
  { to: '/media', label: 'Media library', icon: FolderOpen, soon: true },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
  { to: '/account', label: 'My account', icon: UserCog },
]
