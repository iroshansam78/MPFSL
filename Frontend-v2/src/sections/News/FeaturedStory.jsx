import SafeImage from '../../components/ui/SafeImage/SafeImage.jsx'
import TagLinks from '../../components/ui/TagLinks/TagLinks.jsx'

function FeaturedStory({ story, onOpenPhotos }) {
  return (
    <article className="featured reveal">
      <button type="button" className="featured-img" onClick={() => onOpenPhotos([story.image], 0)}>
        <SafeImage src={story.image.src} alt={story.image.alt} />
        <div className="featured-stat">
          <strong>{story.stat.value}</strong>
          <span>{story.stat.label}</span>
        </div>
      </button>

      <div className="featured-copy">
        <span className="tag">{story.tag}</span>
        <h3>{story.title}</h3>
        {story.body.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <div className="meta">
          <span>{story.meta}</span>
          <TagLinks links={story.links} label="Related organizations" />
        </div>
      </div>
    </article>
  )
}

export default FeaturedStory
