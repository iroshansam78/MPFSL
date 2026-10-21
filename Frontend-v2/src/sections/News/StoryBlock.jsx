// A list item's text gets a space after the bold part, unless it starts with punctuation (", UIPM…").
const joiner = (text) => (!text || /^[,.;:)!?]/.test(text) ? '' : ' ')

/** One block of a story's text: { type: 'h4' | 'p', text } or { type: 'list', items: [{ strong, text }] }. */
function StoryBlock({ block }) {
  if (block.type === 'h4') return <h4>{block.text}</h4>
  if (block.type === 'list') {
    return (
      <ul className="facts">
        {block.items.map((item, i) => (
          <li key={i}>
            {item.strong && <strong>{item.strong}</strong>}
            {item.strong && joiner(item.text)}
            {item.text}
          </li>
        ))}
      </ul>
    )
  }
  return <p>{block.text}</p>
}

export default StoryBlock
