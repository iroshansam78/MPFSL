import SafeImage from '../../components/ui/SafeImage/SafeImage.jsx'
import TagLinks from '../../components/ui/TagLinks/TagLinks.jsx'
import StoryBlock from './StoryBlock.jsx'

// `priority`: the photo is in the first screen (the News page), so load it straight away instead of lazily.
function FeaturedStory({ story, onOpenPhotos, priority = false }) {
  const image = story.images[0]
  const { stat, meta } = story.feature

  return (
    <article className="featured reveal">
      {image && (
        <button type="button" className="featured-img" onClick={() => onOpenPhotos([image], 0)}>
          <SafeImage
            src={image.src}
            alt={image.alt}
            {...(priority && { loading: 'eager', fetchPriority: 'high' })}
          />
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
