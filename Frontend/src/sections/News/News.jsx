import { featured, stories } from '../../data/news.js'
import { COLORS } from '../../constants/colors.js'
import SectionHead from '../../components/ui/SectionHead/SectionHead.jsx'
import FeaturedStory from './FeaturedStory.jsx'
import Milestones from './Milestones.jsx'
import Story from './Story.jsx'
import './News.css'

const STORY_ACCENTS = [COLORS.obstacle, COLORS.gold, COLORS.swim, COLORS.laser, COLORS.fencing]

function News({ onOpenPhotos }) {
  return (
    <section id="news" className="section">
      <div className="container">
        <SectionHead label="News" title={featured.heading} />
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
