import React from 'react'
import { useReveal } from '../hooks/useReveal.js'

const PROJECTS = [
  {
    name: 'AnimeVerse',
    tagline: 'Full-stack anime discovery platform',
    description:
      'A full-stack anime discovery platform with JWT-authenticated accounts, watchlists, and a social review system with likes, replies, and favorites. A custom caching layer on top of the Jikan API cut external calls by 80% and kept the UI fast.',
    stack: ['React.js', 'Django REST Framework', 'PostgreSQL', 'JWT Auth', 'CSS Modules'],
    metric: '80% fewer external API calls',
    links: { live: 'https://animeverse-ochre.vercel.app/', code: 'https://github.com/Ayushm28114/AnimeList' },
  },
  {
    name: 'Crypto Trade Calculator',
    tagline: 'Real-time crypto tax & portfolio tool',
    description:
      'A hackathon-built crypto tax calculator with real-time pricing via CoinGecko, FIFO-based gain/loss logic, and CSV/TXT export. Solo-designed UI/UX with dark/light modes and animated transitions, deployed to Vercel with CI/CD.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'CoinGecko API', 'Vercel'],
    metric: 'Shipped same-day at hackathon',
    links: { live: 'https://crypto-trade-calculator.surge.sh/', code: 'https://github.com/Ayushm28114/Crypto-Trade-Calculator' },
  },
  {
    name: 'DSA Problem Bank',
    tagline: 'Algorithmic problem solving',
    description:
      'An ongoing collection of solved algorithmic problems across arrays, hashing, recursion, and linked lists — used to keep core CS fundamentals sharp alongside applied project work.',
    stack: ['Java', 'Python', 'Data Structures', 'Algorithms'],
    metric: 'Core CS fundamentals',
    links: { live: 'https://leetcode.com/u/Ayush28114/', code: 'https://github.com/Ayushm28114/Data-Structure-and-Algorithm' },
  },
]

export default function Projects() {
  const ref = useReveal()

  return (
    <section id="projects" className="section" ref={ref}>
      <div className="section__inner">
        <div className="section__heading" data-reveal>
          <p className="eyebrow">// projects</p>
          <h2>Selected work.</h2>
        </div>

        <div className="projects__grid">
          {PROJECTS.map((p) => (
            <article className="project-card" key={p.name} data-reveal>
              <div className="project-card__top">
                <div className="project-card__glyph">{p.name.charAt(0)}</div>
                <div className="project-card__links">
                  <a href={p.links.code} target="_blank" rel="noreferrer" aria-label={`${p.name} code repository`}>
                    Code
                  </a>
                  <a href={p.links.live} aria-label={`${p.name} live demo`}>
                    Live
                  </a>
                </div>
              </div>

              <h3>{p.name}</h3>
              <p className="project-card__tagline">{p.tagline}</p>
              <p className="project-card__desc">{p.description}</p>

              <div className="project-card__stack">
                {p.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>

              <div className="project-card__metric">{p.metric}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
