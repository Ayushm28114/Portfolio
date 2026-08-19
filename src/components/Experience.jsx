import React from 'react'
import { useReveal } from '../hooks/useReveal.js'

const TIMELINE = [
  {
    period: '2024 — Present',
    title: 'Full‑Stack Developer',
    org: 'AnimeVerse (Personal Project)',
    points: [
      'Built a full-stack anime discovery platform with React.js and Django REST Framework, using JWT authentication.',
      'Designed a custom caching layer for the API, cutting external calls by 80% and improving response time.',
      'Shipped watchlist, profiles, and a social review system with likes, replies, and favorites — maintained across multiple releases.',
    ],
  },
  {
    period: 'Hackathon',
    title: 'Frontend Owner',
    org: 'Crypto Trade Calculator',
    points: [
      'Built a real-time crypto tax calculator solo with React, TypeScript, and Tailwind CSS under time pressure.',
      'Integrated the CoinGecko API for live prices and implemented FIFO-based gain/loss calculations with CSV/TXT export.',
      'Designed dark/light themes with animated transitions and deployed to Vercel with CI/CD.',
    ],
  },
  {
    period: '2022 — Present',
    title: 'Team Captain',
    org: 'Infinity Loop — incl. Smart India Hackathon',
    points: [
      'Led a competitive hackathon team through technical strategy, task delegation, and end-to-end project execution.',
      'Learned new tools quickly under deadline pressure while keeping the team aligned across events.',
    ],
  },
]

export default function Experience() {
  const ref = useReveal()

  return (
    <section id="experience" className="section section--alt" ref={ref}>
      <div className="section__inner">
        <div className="section__heading" data-reveal>
          <p className="eyebrow"></p>
          <h2>What I've built and led.</h2>
        </div>

        <div className="timeline">
          {TIMELINE.map((item) => (
            <div className="timeline__item" key={item.title} data-reveal>
              <div className="timeline__marker">
                <span className="timeline__dot" />
                <span className="timeline__line" />
              </div>
              <div className="timeline__card">
                <span className="timeline__period">{item.period}</span>
                <h3>{item.title}</h3>
                <p className="timeline__org">{item.org}</p>
                <ul>
                  {item.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
