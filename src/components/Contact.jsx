import { useState } from 'react'

// ---- config ----
const EMAIL = 'ayushm281104@gmail.com'
const GITHUB_URL = 'https://github.com/Ayushm28114'
const LINKEDIN_URL = 'https://www.linkedin.com/in/ayush-mishra-full-stack/'
const WEB3FORMS_KEY = 'db5d7a4e-0175-4977-813a-b092c293b731' 

const initial = { name: '', email: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(initial)
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const botcheck = new FormData(e.target).get('botcheck')
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          subject: `Portfolio contact from ${form.name.trim()}`,
          botcheck: botcheck || '',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.success !== true) throw new Error('rejected')
      setStatus('success')
      setForm(initial)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="contact-section">
      <p className="section-label">{'// contact'}</p>
      <h2 className="contact-title">Let's build something<br />worth talking about.</h2>
      <p className="contact-sub">
        Hiring for a fresher software role, or just want to say hi? My inbox is open.
      </p>

      <div className="contact-grid">
        <div className="contact-channels">
          <a className="channel-card" href={`mailto:${EMAIL}`}>
            <span className="channel-name">Email</span>
            <span className="channel-value">{EMAIL}</span>
          </a>
          <a className="channel-card" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <span className="channel-name">GitHub</span>
            <span className="channel-value">github.com/Ayushm28114</span>
          </a>
          <a className="channel-card" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
            <span className="channel-name">LinkedIn</span>
            <span className="channel-value">Connect with me →</span>
          </a>
        </div>

        <form className="contact-form" onSubmit={onSubmit}>
          <label>
            <span>Name</span>
            <input
              name="name" type="text" required maxLength={80}
              placeholder="Your name" value={form.name} onChange={onChange}
              disabled={status === 'sending'}
            />
          </label>
          <label>
            <span>Email</span>
            <input
              name="email" type="email" required maxLength={120}
              placeholder="you@example.com" value={form.email} onChange={onChange}
              disabled={status === 'sending'}
            />
          </label>
          <label>
            <span>Message</span>
            <textarea
              name="message" required maxLength={2000} rows={5}
              placeholder="What would you like to talk about?"
              value={form.message} onChange={onChange}
              disabled={status === 'sending'}
            />
          </label>
          {/* honeypot — invisible to humans, catches bots */}
          <input type="checkbox" name="botcheck" className="hp-field" tabIndex={-1} autoComplete="off" />

          <button type="submit" className="contact-btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>

          {status === 'success' && (
            <p className="form-note form-success">
              Message sent — I usually reply within a day.
            </p>
          )}
          {status === 'error' && (
            <p className="form-note form-error">
              Couldn't send it. Please email me directly at{' '}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
