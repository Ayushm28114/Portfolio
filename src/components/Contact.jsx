import React, { useState } from 'react'
import { useReveal } from '../hooks/useReveal.js'

const CONTACT_DETAILS = [
  { label: 'Email', value: 'ayushm281104@gmail.com', href: 'mailto:ayushm281104@gmail.com' },
  { label: 'Location', value: 'Greater Noida West, UP, India', href: null },
  { label: 'GitHub', value: 'github.com/Ayushm28114', href: 'https://github.com/Ayushm28114' },
  { label: 'LinkedIn', value: 'linkedin.com/in/ayush-mishra', href: 'https://linkedin.com' },
]

export default function Contact() {
  const ref = useReveal()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sent

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Wire this up to a form backend (Formspree, EmailJS, etc.) or an API route.
    setStatus('sent')
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <section id="contact" className="section section--alt" ref={ref}>
      <div className="section__inner">
        <div className="section__heading" data-reveal>
          <p className="eyebrow"></p>
          <h2>Let's build something.</h2>
          <p className="section__subtext">
            Open to frontend and full-stack roles, internships, and interesting collaborations.
          </p>
        </div>

        <div className="contact__grid">
          <div className="contact__details" data-reveal>
            {CONTACT_DETAILS.map((d) => (
              <div className="contact__row" key={d.label}>
                <span className="contact__label">{d.label}</span>
                {d.href ? (
                  <a href={d.href} target={d.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {d.value}
                  </a>
                ) : (
                  <span className="contact__value">{d.value}</span>
                )}
              </div>
            ))}
          </div>

          <form className="contact__form" onSubmit={handleSubmit} data-reveal>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" required rows={5} value={form.message} onChange={handleChange} placeholder="What are you building?" />
            </div>
            <button type="submit" className="btn btn--primary btn--wide">
              {status === 'sent' ? 'Message sent ✓' : 'Send message'}
            </button>
            {status === 'sent' && <p className="contact__confirm">Thanks — I'll get back to you soon.</p>}
          </form>
        </div>
      </div>
    </section>
  )
}
