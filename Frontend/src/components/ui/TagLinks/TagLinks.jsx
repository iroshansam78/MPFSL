import './TagLinks.css'

// Row of outlined external links (hashtags, partner organisations). Renders nothing if empty.
function TagLinks({ links, label }) {
  if (!links?.length) return null

  return (
    <nav className="tags" aria-label={label}>
      {links.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
          {link.label}
        </a>
      ))}
    </nav>
  )
}

export default TagLinks
