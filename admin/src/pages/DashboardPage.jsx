import { ArrowRight, FolderOpen, Images, Newspaper, Users } from 'lucide-react'
import { Link } from 'react-router'
import Card from '../components/ui/Card.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useMe } from '../hooks/useAuth.js'

const SECTIONS = [
  { to: '/news', icon: Newspaper, title: 'News', text: 'Write, publish and feature stories with photos.', soon: true },
  { to: '/gallery', icon: Images, title: 'Gallery', text: 'Upload photos, add captions and arrange the gallery.', soon: true },
  { to: '/media', icon: FolderOpen, title: 'Media library', text: 'Every uploaded photo, ready to reuse.', soon: true },
  { to: '/users', icon: Users, title: 'Users', text: 'Create editor accounts and reset passwords.', adminOnly: true },
]

function DashboardPage() {
  const { data: user } = useMe()
  const firstName = user.name.split(' ')[0]
  const sections = SECTIONS.filter((s) => !s.adminOnly || user.role === 'admin')

  return (
    <>
      <PageHeader title={`Hello, ${firstName}`} description="What would you like to update on the website today?" />

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ to, icon: Icon, title, text, soon }) => (
          <Link key={to} to={to} className="group rounded-xl focus-visible:outline-offset-4">
            <Card className="h-full transition-colors group-hover:border-brand/50">
              <div className="flex items-start gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-info-soft text-brand">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="grid flex-1 gap-1">
                  <h2 className="flex items-center gap-2 font-display text-xl font-extrabold uppercase">
                    {title}
                    {soon && (
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 font-sans text-[10px] font-bold tracking-wide text-muted">
                        COMING SOON
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-muted">{text}</p>
                </div>
                <ArrowRight className="mt-1 size-5 text-muted transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}

export default DashboardPage
