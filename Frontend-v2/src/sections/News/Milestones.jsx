function Milestones({ items }) {
  return (
    <ol className="milestones" aria-label="Gayani Dassanayake’s national titles">
      {items.map((item, i) => (
        <li key={item.tag} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}>
          <span className="tag">{item.tag}</span>
          <h4>{item.title}</h4>
          <p>{item.body}</p>
        </li>
      ))}
    </ol>
  )
}

export default Milestones
