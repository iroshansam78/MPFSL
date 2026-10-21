import { useId, useState } from 'react'
import PhotoGrid from '../../components/ui/PhotoGrid/PhotoGrid.jsx'
import TagLinks from '../../components/ui/TagLinks/TagLinks.jsx'
import StoryBlock from './StoryBlock.jsx'

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

      {story.images.length > 0 && <PhotoGrid images={story.images} onOpen={onOpenPhotos} />}
    </article>
  )
}

export default Story
