import SectionHead from '../../components/ui/SectionHead/SectionHead.jsx'
import { useNews } from '../../hooks/useNews.js'
import { largest } from '../../hooks/useSitePhotos.js'
import FeaturedStory from './FeaturedStory.jsx'
import Milestones from './Milestones.jsx'
import Story from './Story.jsx'
import './News.css'

// Story cards take these colours in turn, by position (the website's discipline colours).
const STORY_ACCENTS = ['var(--c-obstacle)', 'var(--c-gold)', 'var(--c-swim)', 'var(--c-laser)', 'var(--c-fencing)']

// `priority`: News is the first section on the page (the News page), not further down (home).
function News({ onOpenPhotos, priority = false }) {
  const { featured, stories } = useNews()
  const openPhotos = (images, index) => onOpenPhotos(largest(images), index)

  return (
    <section id="news" className="section" style={{ '--accent': 'var(--c-obstacle)' }}>
      <div className="container">
        {featured ? (
          <>
            <SectionHead label="News" title={featured.feature.heading} highlight={featured.feature.highlight} />
            <FeaturedStory story={featured} onOpenPhotos={openPhotos} priority={priority} />
            {featured.feature.milestones.length > 0 && <Milestones items={featured.feature.milestones} />}
          </>
        ) : (
          <SectionHead label="News" title="News from the federation" highlight="federation" />
        )}

        {stories.length > 0 && (
          <>
            {featured && <h3 className="subhead reveal">More from the federation</h3>}
            <div className="stories">
              {stories.map((story, i) => (
                <Story
                  key={story.id}
                  story={story}
                  accent={STORY_ACCENTS[i % STORY_ACCENTS.length]}
                  onOpenPhotos={openPhotos}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default News
