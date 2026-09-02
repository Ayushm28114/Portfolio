import React, { useEffect, useState } from 'react'

const ROLES = ['React.js Developer', 'Frontend Engineer', 'Full-Stack Developer', 'Backend Developer', 'Software Engineer']

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = ROLES[roleIndex]
    const speed = deleting ? 35 : 70
    const timeout = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, text.length + 1)
        setText(next)
        if (next === current) setTimeout(() => setDeleting(true), 1400)
      } else {
        const next = current.slice(0, text.length - 1)
        setText(next)
        if (next === '') {
          setDeleting(false)
          setRoleIndex((i) => (i + 1) % ROLES.length)
        }
      }
    }, speed)
    return () => clearTimeout(timeout)
  }, [text, deleting, roleIndex])

  const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="top" className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__text">
          <p className="eyebrow">// Greater Noida, India — open to opportunities</p>
          <h1 className="hero__headline">
            Ayush Mishra
          </h1>
          <div className="hero__role-line">
            <span className="hero__bracket">&lt;</span>
            <span className="hero__role">{text}</span>
            <span className="hero__type-cursor" aria-hidden="true">|</span>
            <span className="hero__bracket">/&gt;</span>
          </div>
          <p className="hero__summary">
            Computer Science undergrad who builds fast, scalable interfaces with React and ships
            them end-to-end — from schema to API to pixel. Cut external API latency by 80% on a
            production caching layer and led a hackathon team through the Smart India Hackathon.
          </p>
          <div className="hero__cta-row">
            <button className="btn btn--primary" onClick={() => scrollTo('#projects')}>
              View Projects
            </button>
            <a
              className="btn btn--ghost"
              href={`${import.meta.env.BASE_URL}Ayush_Mishra_Resume.pdf`}
              download
            >
              <span>Download Resume</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          <div className="hero__socials">
            <a href="https://github.com/Ayushm28114" target="_blank" rel="noreferrer">GitHub</a>
            <span className="dot">·</span>
            <a href="mailto:ayushm281104@gmail.com">Email</a>
            <span className="dot">·</span>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__card">
            <div className="hero__card-top">
              <span className="dot-red" /><span className="dot-yellow" /><span className="dot-green" />
              <span className="hero__card-filename">profile.jsx</span>
            </div>
            <div className="hero__card-code">
              <p><span className="tok-key">const</span> <span className="tok-var">engineer</span> = {'{'}</p>
              <p>&nbsp;&nbsp;stack: <span className="tok-str">'React, JS, Python'</span>,</p>
              <p>&nbsp;&nbsp;focus: <span className="tok-str">'UI & performance'</span>,</p>
              <p>&nbsp;&nbsp;shipping: <span className="tok-bool">true</span>,</p>
              <p>{'}'}</p>
            </div>
          </div>
        </div>
      </div>

      <button className="hero__scroll-hint" onClick={() => scrollTo('#about')} aria-label="Scroll to About section">
        <span className="hero__scroll-line" />
        Scroll
      </button>
    </section>
  )
}
