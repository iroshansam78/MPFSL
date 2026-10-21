// The website's discipline colours (admin.css --c-story-*, copied from the website's styles/variables.css).
// The website gives story cards these colours in turn, by position (sections/News/News.jsx).
export const ACCENTS = [
  { name: 'orange', border: 'border-l-story-obstacle', text: 'text-story-obstacle', dot: 'bg-story-obstacle' },
  { name: 'gold', border: 'border-l-story-gold', text: 'text-story-gold', dot: 'bg-story-gold' },
  { name: 'green', border: 'border-l-story-swim', text: 'text-story-swim', dot: 'bg-story-swim' },
  { name: 'red', border: 'border-l-story-laser', text: 'text-story-laser', dot: 'bg-story-laser' },
  { name: 'blue', border: 'border-l-story-fencing', text: 'text-story-fencing', dot: 'bg-story-fencing' },
]

export const accentFor = (position) => ACCENTS[position % ACCENTS.length]

/** Drafts aren't on the website, so they have no colour yet. */
export const DRAFT = { name: 'grey', border: 'border-l-line', text: 'text-muted', dot: 'bg-line' }
