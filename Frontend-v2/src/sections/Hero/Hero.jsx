import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { hero } from '../../data/hero.js'
import { site } from '../../data/site.js'
import { useHeroSlides } from '../../hooks/useHeroSlides.js'
import HeroCaption from './HeroCaption.jsx'
import './Hero.css'

const HeroCanvas = lazy(() => import('../../scene/HeroCanvas.jsx'))

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Full-screen hero: a still photo shows instantly, then the WebGL slideshow fades in over it.
function Hero() {
  const slides = useHeroSlides(hero.slides, hero.fallback)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [reduced] = useState(prefersReducedMotion)
  const section = useRef()

  // Pause the slideshow while the hero is scrolled out of view
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.02 })
    observer.observe(section.current)
    return () => observer.disconnect()
  }, [])

  const count = slides?.length || 0

  // Auto-advance
  useEffect(() => {
    if (count < 2 || !visible || reduced) return
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), hero.slideDuration)
    return () => clearTimeout(timer)
  }, [index, count, visible, reduced])

  const ready = count > 0
  const current = slides?.[index]

  return (
    <section id="top" className={`hero${ready ? ' is-ready' : ''}`} ref={section} aria-label="Introduction">
      <div className="hero-media" aria-hidden="true">
        <div className="hero-still" style={{ backgroundImage: `url(${hero.slides[0]?.remote || hero.fallback.src})` }} />
        {ready && (
          <Suspense fallback={null}>
            <HeroCanvas slides={slides} index={index} paused={!visible} reduced={reduced} />
          </Suspense>
        )}
        <div className="hero-scrim" />
      </div>

      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="hero-kicker">
            <span className="stripe" aria-hidden="true" />
            Official national federation
          </p>
          <h1>
            <span className="h1-name">{site.name}</span>
            <span className="h1-display" aria-hidden="true">
              <span>Five disciplines.</span>
              <span>
                <em>One</em> champion.
              </span>
            </span>
          </h1>
          <p className="hero-lead">
            <span lang="si" className="si">
              {site.sinhala}
            </span>
            <span>Developing athletes, growing competition and elevating the sport across Sri Lanka.</span>
          </p>
          <div className="cta-row">
            <a className="btn primary" href="#news">
              Latest news
            </a>
            <a className="btn ghost" href="#about">
              About the sport
            </a>
          </div>
        </div>

        <div className="hero-foot">
          <ul className="hero-facts" aria-label="Federation highlights">
            {hero.facts.map((fact) => (
              <li key={fact.label}>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </li>
            ))}
          </ul>
          {current && (
            <HeroCaption
              slides={slides}
              current={current}
              index={index}
              onSelect={setIndex}
              playing={visible && !reduced}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default Hero
