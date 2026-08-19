import React from 'react'
import { useReveal } from '../hooks/useReveal.js'

const DEGREES = [
  {
    school: 'Noida Institute of Engineering and Technology',
    degree: 'Bachelor of Technology, Computer Science and Engineering',
    period: '2022 — 2026',
    detail: 'CGPA: 7.1 / 10.0',
  },
  {
    school: 'Aster Public School',
    degree: 'Senior Secondary (XII)',
    period: '2022',
    detail: 'Percentage: 89%',
  },
]

const CERTS = [
  { name: 'JavaScript Essentials', issuer: 'Infosys' },
  { name: 'ReactJS', issuer: 'Infosys' },
  { name: 'Blockchain Basics', issuer: 'The State University of New York' },
]

export default function Education() {
  const ref = useReveal()

  return (
    <section id="education" className="section" ref={ref}>
      <div className="section__inner">
        <div className="section__heading" data-reveal>
          <p className="eyebrow"></p>
          <h2>Academic Background.</h2>
        </div>

        <div className="education__grid">
          <div className="education__degrees" data-reveal>
            {DEGREES.map((d) => (
              <div className="degree-card" key={d.school}>
                <div className="degree-card__period">{d.period}</div>
                <h3>{d.degree}</h3>
                <p className="degree-card__school">{d.school}</p>
                <p className="degree-card__detail">{d.detail}</p>
              </div>
            ))}
          </div>

          <div className="education__certs" data-reveal>
            <h3 className="education__certs-title">Certifications</h3>
            <ul className="cert-list">
              {CERTS.map((c) => (
                <li key={c.name}>
                  <span className="cert-list__check" aria-hidden="true">✓</span>
                  <div>
                    <span className="cert-list__name">{c.name}</span>
                    <span className="cert-list__issuer">{c.issuer}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
