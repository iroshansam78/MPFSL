function Card({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6 ${className}`}>
      {(title || description) && (
        <header className="mb-4 grid gap-1">
          {title && <h2 className="font-display text-xl font-extrabold uppercase">{title}</h2>}
          {description && <p className="text-sm text-muted">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}

export default Card
