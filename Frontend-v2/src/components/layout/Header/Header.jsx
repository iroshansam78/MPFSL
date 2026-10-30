import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import logoForDarkBg from '../../../assets/images/logo-dark.png'
import logoForLightBg from '../../../assets/images/logo-light.png'
import { menuPages } from '../../../data/pages.js'
import { site } from '../../../data/site.js'
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx'
import './Header.css'

// Two versions of the logo; Header.css shows whichever suits the header's current background
// (white lettering over the hero photo / in dark mode, navy lettering on the light header).
function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${site.name} home`}>
      <img className="logo-on-dark" src={logoForDarkBg} alt={`${site.name} logo`} width="231" height="180" />
      <img className="logo-on-light" src={logoForLightBg} alt="" aria-hidden="true" width="231" height="180" />
    </Link>
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
          {menuPages.map((page) => (
            <NavLink key={page.path} to={page.path}>
              {page.label}
            </NavLink>
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
