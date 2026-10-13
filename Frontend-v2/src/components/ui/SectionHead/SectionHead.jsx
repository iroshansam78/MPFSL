import './SectionHead.css'

// Renders `text`, wrapping the first occurrence of `phrase` in the accent colour.
function Highlight({ text, phrase }) {
  const start = phrase ? text.indexOf(phrase) : -1
  if (start < 0) return text

  return (
    <>
      {text.slice(0, start)}
      <span className="hl">{phrase}</span>
      {text.slice(start + phrase.length)}
    </>
  )
}

// Section label + h2 that fades in on scroll. `highlight` colours part of the title.
function SectionHead({ label, title, highlight, children }) {
  return (
    <div className="section-head reveal">
      <p className="section-label">{label}</p>
      <h2>
        <Highlight text={title} phrase={highlight} />
      </h2>
      {children}
    </div>
  )
}

export default SectionHead
