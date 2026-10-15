import { Hammer } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

// Placeholder for screens whose API isn't built yet (News, Gallery, Media — roadmap Phases 2–4).
function ComingSoonPage({ title, description }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning">
            <Hammer className="size-6" aria-hidden="true" />
          </span>
          <h2 className="font-display text-2xl font-extrabold uppercase">Coming soon</h2>
          <p className="max-w-md text-sm text-muted">{description}</p>
        </div>
      </Card>
    </>
  )
}

export default ComingSoonPage
