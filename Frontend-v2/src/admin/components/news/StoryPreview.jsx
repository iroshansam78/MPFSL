// Previews of news stories as the website draws them, in the website's colours (admin.css
// --c-story-*, copied from the website's styles/variables.css).

import { DRAFT } from './accents.js'

/** Photos like the website's story grid: one photo large, 2–4 in two columns. */
function Photos({ images }) {
  const shown = images.filter((image) => image.preview)
  if (!shown.length) return null
  return (
    <div className={`grid content-start gap-2 ${shown.length > 1 ? 'grid-cols-2' : ''}`}>
      {shown.map((image, i) => (
        <img
          key={i}
          src={image.preview}
          alt=""
          className={`w-full rounded object-cover ${shown.length > 1 ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}
        />
      ))}
    </div>
  )
}

/** A story card. `accent` null = draft (not on the website, so no colour). */
export function StoryCard({ story, accent, children, dimmed = false }) {
  const colour = accent ?? DRAFT
  return (
    <article className={`grid gap-5 rounded-xl border border-l-4 border-line bg-surface p-5 shadow-sm sm:p-6 ${colour.border}`}>
      <div className={`grid gap-5 lg:grid-cols-2 ${dimmed ? 'opacity-60' : ''}`}>
        <div className="grid content-start gap-2">
          <p className={`text-xs font-bold tracking-[0.08em] uppercase ${colour.text}`}>{story.tag || 'Tag line'}</p>
          <h3 className="font-display text-2xl leading-tight font-extrabold sm:text-3xl">{story.title || 'Story title'}</h3>
          <p className="line-clamp-4 text-sm text-muted">{story.lead || 'The intro paragraph appears here.'}</p>
          {(story.body?.length > 0 || story.links?.length > 0) && (
            <p className={`text-sm font-bold ${colour.text}`}>Read more +</p>
          )}
        </div>
        <Photos images={story.images} />
      </div>
      {children}
    </article>
  )
}

/** Renders `text` with the first `phrase` in the news section's colour, like the website's headline. */
function Highlight({ text, phrase }) {
  const start = phrase ? text.indexOf(phrase) : -1
  if (start < 0) return text
  return (
    <>
      {text.slice(0, start)}
      <span className="text-story-obstacle">{phrase}</span>
      {text.slice(start + phrase.length)}
    </>
  )
}

/** The top of the news section: headline, the featured story card and its milestones. */
export function FeaturedPreview({ story, children }) {
  const feature = story.feature ?? { heading: story.title, highlight: '', stat: null, milestones: [], meta: '' }
  const image = story.images.find((i) => i.preview)

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <p className="text-xs font-bold tracking-[0.12em] text-story-obstacle uppercase">News</p>
        <h3 className="font-display text-3xl leading-none font-extrabold uppercase sm:text-4xl">
          <Highlight text={feature.heading || 'Section headline'} phrase={feature.highlight} />
        </h3>
      </div>

      <article className="grid overflow-hidden rounded-xl border border-line bg-surface shadow-sm lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative min-h-64 bg-surface-2 lg:min-h-80">
          {image && <img src={image.preview} alt="" className="absolute inset-0 size-full object-cover" />}
          {feature.stat?.value && (
            <div className="absolute bottom-0 left-0 grid bg-story-sun px-5 py-3 text-[#2a1a00]">
              <strong className="font-display text-5xl leading-[0.9] font-black italic">{feature.stat.value}</strong>
              <span className="text-xs font-bold tracking-wide uppercase">{feature.stat.label}</span>
            </div>
          )}
        </div>
        <div className="grid content-start gap-2 p-5 sm:p-8">
          <p className="text-xs font-bold tracking-[0.08em] text-story-gold uppercase">{story.tag || 'Tag line'}</p>
          <h4 className="font-display text-3xl leading-tight font-extrabold italic">{story.title || 'Story title'}</h4>
          <p className="line-clamp-5 text-sm text-muted">{story.lead}</p>
          {feature.meta && <p className="mt-2 border-t border-line pt-3 text-sm text-muted">{feature.meta}</p>}
        </div>
      </article>

      {feature.milestones?.length > 0 && (
        <ol className="grid gap-3 md:grid-cols-3">
          {feature.milestones.map((milestone, i) => (
            <li key={i} className="rounded-xl border-t-4 border-story-sun bg-surface p-4 shadow-sm">
              <p className="text-xs font-bold tracking-[0.08em] text-story-obstacle uppercase">{milestone.tag}</p>
              <p className="mt-1 font-display text-xl leading-tight font-extrabold">{milestone.title}</p>
              <p className="mt-1 line-clamp-3 text-sm text-muted">{milestone.body}</p>
            </li>
          ))}
        </ol>
      )}
      {children}
    </div>
  )
}
