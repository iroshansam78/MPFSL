import { site } from '../../../data/site.js'
import { photoCredits } from '../../../data/stockPhotos.js'
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

      <div className="container credits">
        Discipline photos via Unsplash:{' '}
        {photoCredits.map((credit, i) => (
          <span key={credit.by}>
            <a href={credit.page} target="_blank" rel="noreferrer">
              {credit.by}
            </a>
            {i < photoCredits.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    </footer>
  )
}

export default Footer
