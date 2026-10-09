import { site } from '../../data/site.js'
import SocialLinks from '../../components/ui/SocialLinks/SocialLinks.jsx'
import './Contact.css'

const contactItems = [
  { label: 'Email', text: site.email, href: `mailto:${site.email}` },
  { label: 'Website', text: 'mpfsl.net', href: site.website, external: true },
  { label: 'Facebook', text: 'facebook.com/slmpf', href: site.facebook, external: true },
]

function Contact() {
  return (
    <section id="contact" className="section">
      <div className="container contact reveal">
        <div>
          <p className="section-label">Contact</p>
          <h2>Connect with the federation</h2>
          <p className="contact-lead">
            Athletes, coaches, schools and partners — get in touch to get involved with modern pentathlon in Sri
            Lanka.
          </p>
          <SocialLinks />
        </div>

        <dl className="contact-list">
          {contactItems.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>
                <a href={item.href} {...(item.external && { target: '_blank', rel: 'noreferrer' })}>
                  {item.text}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default Contact
