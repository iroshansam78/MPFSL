// One full-screen step of the journey. Text sits over the 3D scene; clicks pass through except on links/buttons.
function StagePanel({ accent, className = '', id, children }) {
  return (
    <section id={id} className={`panel ${className}`.trim()} style={{ '--accent': accent }}>
      {children}
    </section>
  )
}

export default StagePanel
