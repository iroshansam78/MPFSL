import { site } from '../../../data/site.js'
import './Footer.css'

// The year the site was built (set in vite.config.js), so the pre-rendered page and the browser agree.
// Every deploy refreshes it.
const COPYRIGHT_YEAR = import.meta.env.VITE_BUILD_YEAR

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          © {COPYRIGHT_YEAR} {site.name}
        </p>
        <p lang="si" className="si">
          {site.sinhala}
        </p>
        <a href={site.facebook} target="_blank" rel="noreferrer">
          Official Facebook page
        </a>
      </div>
    </footer>
  )
}

export default Footer
