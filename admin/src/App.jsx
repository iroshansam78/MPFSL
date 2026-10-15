import { BrowserRouter, Route, Routes } from 'react-router'
import AdminLayout from './components/layout/AdminLayout.jsx'
import { GuestOnly, RequireAdmin, RequireAuth, RequireTemporaryPassword } from './components/layout/RouteGuards.jsx'
import AccountPage from './pages/AccountPage.jsx'
import ChangePasswordPage from './pages/ChangePasswordPage.jsx'
import ComingSoonPage from './pages/ComingSoonPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import UsersPage from './pages/users/UsersPage.jsx'

function App() {
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
            <Route
              path="news/*"
              element={<ComingSoonPage title="News" description="Writing and publishing stories arrives with the news API (roadmap Phases 3–4)." />}
            />
            <Route
              path="gallery/*"
              element={<ComingSoonPage title="Gallery" description="Uploading and arranging gallery photos arrives with the gallery API (Phases 3–4)." />}
            />
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

export default App
