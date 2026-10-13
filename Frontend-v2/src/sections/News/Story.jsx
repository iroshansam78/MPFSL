import { useId, useState } from 'react'
import PhotoGrid from '../../components/ui/PhotoGrid/PhotoGrid.jsx'
import TagLinks from '../../components/ui/TagLinks/TagLinks.jsx'

// One block of a story's expandable body (see the format notes in data/news.js).
function StoryBlock({ block }) {
  if (block.type === 'h4') return <h4>{block.text}</h4>
  if (block.type === 'list') {
    return (
      <ul className="facts">
        {block.items.map((item) => (
          <li key={item.strong}>
            <strong>{item.strong}</strong>
            {item.text}
          </li>
        ))}
      </ul>
    )
  }
  return <p>{block.text}</p>
}

// News story card: lead always visible, details behind "Read more", photos on the right.
function Story({ story, accent, onOpenPhotos }) {
  const [expanded, setExpanded] = useState(false)
  const moreId = useId()
  const hasMore = story.body.length > 0 || story.links.length > 0

  return (
    <article className="story reveal" style={{ '--accent': accent }}>
      <div className="story-main">
        <span className="tag">{story.tag}</span>
        <h3>{story.title}</h3>
        <p>{story.lead}</p>

        {hasMore && (
          <>
            <div id={moreId} className="story-more" hidden={!expanded}>
              {story.body.map((block, i) => (
                <StoryBlock key={i} block={block} />
              ))}
              <TagLinks links={story.links} label="Related organizations and topics" />
            </div>
            <button
              type="button"
              className="more-btn"
              aria-expanded={expanded}
              aria-controls={moreId}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? 'Show less' : 'Read more'} <span aria-hidden="true">{expanded ? '−' : '+'}</span>
            </button>
          </>
        )}
      </div>

      <PhotoGrid images={story.images} onOpen={onOpenPhotos} />
    </article>
  )
}

export default Story
