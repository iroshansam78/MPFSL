import { Link } from 'react-router'
import PageHeader from '../components/layout/PageHeader/PageHeader.jsx'
import { menuPages, notFoundPage } from '../data/pages.js'

// Any address that isn't a page. At build time this becomes 404.html, which Vercel serves with status 404.
function NotFoundPage() {
  return (
    <>
      <PageHeader page={notFoundPage} />
      <section className="section">
        <div className="container">
          <h2>
            Try one of <span className="hl">these</span>
          </h2>
          <ul className="not-found-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            {menuPages.map((page) => (
              <li key={page.path}>
                <Link to={page.path}>{page.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

export default NotFoundPage
