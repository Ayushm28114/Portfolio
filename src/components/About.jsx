import React from 'react'
import { useReveal } from '../hooks/useReveal.js'

const STATS = [
  { value: '2', label: 'Full‑stack apps shipped', suffix: '' },
  { value: '80', label: 'Cut in API latency', suffix: '%' },
  { value: '3', label: 'Certifications earned', suffix: '' },
  { value: '4', label: 'Years of CS coursework', suffix: '+' },
]

export default function About() {
  const ref = useReveal()

  return (
    <section id="about" className="section" ref={ref}>
      <div className="section__inner">
        <div className="section__heading" data-reveal>
          <p className="eyebrow">// about</p>
          <h2>Building interfaces people trust, end to end.</h2>
        </div>

        <div className="about__grid">
          <div className="about__copy" data-reveal>
            <p>
              I'm a final‑year Computer Science undergraduate at Noida Institute of Engineering and
              Technology, specialized in building high‑performance, scalable web interfaces with
              React.js. I like taking a complex design and turning it into responsive, user‑centric
              components — then going a layer deeper to make sure the API behind it is fast and the
              code is maintainable.
            </p>
            <p>
              On <strong>AnimeVerse</strong>, that meant designing a custom caching layer that cut
              external API calls by 80% and kept the UI feeling instant. On the{' '}
              <strong>Crypto Trade Calculator</strong>, it meant owning the frontend UI/UX solo under
              hackathon time pressure — dark/light themes, animated transitions, and a working export
              pipeline, deployed same day.
            </p>
            <p>
              I care about UI/UX principles, performance optimization, and clean Git history. As Team
              Captain of <strong>Infinity Loop</strong>, I've led hackathon teams — including at the
              Smart India Hackathon — through technical strategy, task delegation, and shipping under
              deadline pressure.
            </p>
          </div>

          <div className="about__stats" data-reveal>
            {STATS.map((s) => (
              <div className="stat-card" key={s.label}>
                <span className="stat-card__value">
                  {s.value}
                  <span className="stat-card__suffix">{s.suffix}</span>
                </span>
                <span className="stat-card__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
