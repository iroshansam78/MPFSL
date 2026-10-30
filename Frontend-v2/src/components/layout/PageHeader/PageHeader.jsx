import { Link } from 'react-router'
import './PageHeader.css'

/*
 * Banner at the top of every page except home: breadcrumbs, the page's <h1> and a short intro.
 * Dark like the hero, so the header's white-on-dark look works the same on every page.
 */
function PageHeader({ page }) {
  return (
    <header className="page-header">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li aria-current="page">{page.label}</li>
          </ol>
        </nav>
        <h1>{page.heading}</h1>
        {page.intro && <p className="page-intro">{page.intro}</p>}
      </div>
      <div className="page-header-stripe" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </header>
  )
}

export default PageHeader
