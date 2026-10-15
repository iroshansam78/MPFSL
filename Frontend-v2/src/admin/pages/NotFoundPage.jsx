import { Link } from 'react-router'
import Card from '../components/ui/Card.jsx'

function NotFoundPage() {
  return (
    <Card>
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="font-display text-6xl font-extrabold text-gold italic">404</p>
        <h1 className="font-display text-2xl font-extrabold uppercase">Page not found</h1>
        <Link to="/" className="text-sm font-semibold text-brand hover:underline">
          Back to the dashboard
        </Link>
      </div>
    </Card>
  )
}

export default NotFoundPage
