import { featured, stories } from '../../data/news.js'
import SectionHead from '../../components/ui/SectionHead/SectionHead.jsx'
import FeaturedStory from './FeaturedStory.jsx'
import Milestones from './Milestones.jsx'
import Story from './Story.jsx'
import './News.css'

const STORY_ACCENTS = ['var(--c-obstacle)', 'var(--c-gold)', 'var(--c-swim)', 'var(--c-laser)', 'var(--c-fencing)']

function News({ onOpenPhotos }) {
  return (
    <section id="news" className="section" style={{ '--accent': 'var(--c-obstacle)' }}>
      <div className="container">
        <SectionHead label="News" title={featured.heading} highlight={featured.highlight} />
        <FeaturedStory story={featured} onOpenPhotos={onOpenPhotos} />
        <Milestones items={featured.milestones} />

        <h3 className="subhead reveal">More from the federation</h3>
        <div className="stories">
          {stories.map((story, i) => (
            <Story
              key={story.id}
              story={story}
              accent={STORY_ACCENTS[i % STORY_ACCENTS.length]}
              onOpenPhotos={onOpenPhotos}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default News
