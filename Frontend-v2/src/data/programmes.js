import { photos } from './photos.js'
import { withFallback } from './stockPhotos.js'

export const programmes = {
  label: 'Programmes',
  title: 'Developing athletes and growing the sport',
  highlight: 'growing the sport',
  items: [
    {
      title: 'Athlete Development',
      body: 'Creating pathways for emerging talent and supporting elite progression through structured practice and guidance.',
      image: withFallback(photos.ccp2025RunningDrills, 'runningRace'),
    },
    {
      title: 'Competitive Events',
      body: 'Promoting disciplined competition and national-level participation across the modern pentathlon disciplines.',
      image: withFallback(photos.national2025Medals, 'fencingBout'),
    },
    {
      title: 'Community & Growth',
      body: 'Connecting administrators, athletes, and supporters to build a vibrant and sustainable sporting culture.',
      image: withFallback(photos.national2025Group, 'obstacleVault'),
    },
  ],
}
