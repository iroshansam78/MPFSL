import { socialLinks } from '../../../data/site.js'
import SocialIcon from '../../icons/SocialIcon.jsx'
import './SocialLinks.css'

function SocialLinks() {
  return (
    <div className="social" role="group" aria-label="Follow the federation">
      {socialLinks.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label}>
          <SocialIcon name={link.icon} />
        </a>
      ))}
    </div>
  )
}

export default SocialLinks
