import { BrowserRouter, Route, Routes } from 'react-router'
import AdminLayout from './components/layout/AdminLayout.jsx'
import { GuestOnly, RequireAdmin, RequireAuth, RequireTemporaryPassword } from './components/layout/RouteGuards.jsx'
import AccountPage from './pages/AccountPage.jsx'
import ChangePasswordPage from './pages/ChangePasswordPage.jsx'
import ComingSoonPage from './pages/ComingSoonPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import GalleryPage from './pages/gallery/GalleryPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NewsEditorPage from './pages/news/NewsEditorPage.jsx'
import NewsPage from './pages/news/NewsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import UsersPage from './pages/users/UsersPage.jsx'

function AdminRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<RequireTemporaryPassword />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/new" element={<NewsEditorPage />} />
            <Route path="news/:id" element={<NewsEditorPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route
              path="media/*"
              element={<ComingSoonPage title="Media library" description="The photo library arrives with uploads to Cloudflare R2 (Phase 2)." />}
            />
            <Route path="account" element={<AccountPage />} />
            <Route element={<RequireAdmin />}>
              <Route path="users" element={<UsersPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AdminRoutes
