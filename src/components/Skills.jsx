import React from 'react'
import { useReveal } from '../hooks/useReveal.js'

const GROUPS = [
  {
    title: 'Languages',
    items: ['Java', 'JavaScript (ES6+)', 'Python', 'SQL'],
  },
  {
    title: 'Frontend',
    items: ['React.js (Hooks, Context API)', 'HTML5', 'CSS3', 'Framer Motion', 'GSAP', 'Responsive UI Design'],
  },
  {
    title: 'Backend & Databases',
    items: ['Django REST Framework', 'PostgreSQL', 'MySQL', 'MongoDB', 'JWT Authentication'],
  },
  {
    title: 'Data & APIs',
    items: ['RESTful APIs', 'Axios', 'JSON'],
  },
  {
    title: 'Tools & Practices',
    items: ['Git', 'GitHub', 'Postman', 'Vercel', 'CI/CD', 'VS Code', 'Full SDLC'],
  },
  {
    title: 'Core CS',
    items: ['Data Structures', 'Algorithms', 'Problem Solving', 'Software Design Principles'],
  },
]

export default function Skills() {
  const ref = useReveal()

  return (
    <section id="skills" className="section section--alt" ref={ref}>
      <div className="section__inner">
        <div className="section__heading" data-reveal>
          <p className="eyebrow"></p>
          <h2>Toolkit.</h2>
        </div>

        <div className="skills__grid">
          {GROUPS.map((g) => (
            <div className="skills__group" key={g.title} data-reveal>
              <h3>{g.title}</h3>
              <div className="skills__pills">
                {g.items.map((item) => (
                  <span className="pill" key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
