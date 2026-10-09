import './SectionHead.css'

// Section label + h2 that fades in on scroll. `accent` overrides the label colour.
function SectionHead({ label, title, accent, children }) {
  return (
    <div className="section-head reveal" style={accent ? { '--accent': accent } : undefined}>
      <p className="section-label">{label}</p>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

export default SectionHead
