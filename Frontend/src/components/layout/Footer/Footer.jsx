import { site } from '../../../data/site.js'
import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} {site.name}
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
