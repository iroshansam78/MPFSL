import { useEffect, useState } from 'react'
import logo from '../../../assets/images/mpfsl-logo.svg'
import { navLinks, site } from '../../../data/site.js'
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx'
import './Header.css'

// Logo image, falling back to a text mark if the SVG fails to load.
function Logo() {
  const [failed, setFailed] = useState(false)

  return (
    <a href="#top" className="logo" aria-label={`${site.name} home`}>
      {failed ? (
        <span className="logo-text">
          <span className="mark" aria-hidden="true" />
          {site.short}
        </span>
      ) : (
        <img src={logo} alt={`${site.name} logo`} onError={() => setFailed(true)} />
      )}
    </a>
  )
}

// Fixed header: white text over the hero photo, solid background once scrolled (body.scrolled).
function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className={`site-header${open ? ' open' : ''}`}>
      <div className="container nav-wrap">
        <Logo />

        <nav id="main-nav" className="main-nav" aria-label="Main navigation" onClick={() => setOpen(false)}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <a className="btn small primary nav-cta" href={`mailto:${site.email}`}>
            Contact
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="burger" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="sr-only">{open ? 'Close navigation' : 'Open navigation'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
