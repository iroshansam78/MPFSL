import SafeImage from '../../components/ui/SafeImage/SafeImage.jsx'
import TagLinks from '../../components/ui/TagLinks/TagLinks.jsx'
import StoryBlock from './StoryBlock.jsx'

function FeaturedStory({ story, onOpenPhotos }) {
  const image = story.images[0]
  const { stat, meta } = story.feature

  return (
    <article className="featured reveal">
      {image && (
        <button type="button" className="featured-img" onClick={() => onOpenPhotos([image], 0)}>
          <SafeImage src={image.src} alt={image.alt} />
          {stat && (
            <div className="featured-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          )}
        </button>
      )}

      <div className="featured-copy">
        <span className="tag">{story.tag}</span>
        <h3>{story.title}</h3>
        <p>{story.lead}</p>
        {story.body.map((block, i) => (
          <StoryBlock key={i} block={block} />
        ))}
        {(meta || story.links.length > 0) && (
          <div className="meta">
            <span>{meta}</span>
            <TagLinks links={story.links} label="Related organizations" />
          </div>
        )}
      </div>
    </article>
  )
}

export default FeaturedStory
