import { useEffect, useState } from 'react'

const LEETCODE_USER = 'Ayush28114'
const GITHUB_USER = 'Ayushm28114'

function topLanguages(repos, n = 3) {
  const counts = {}
  for (const r of repos) {
    if (!r.fork && r.language) counts[r.language] = (counts[r.language] || 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([lang]) => lang)
}

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
  </svg>
)

/**
 * StatsStrip — live LeetCode + GitHub numbers.
 * Public APIs only, no keys. Renders nothing if all sources fail.
 */
export default function StatsStrip() {
  const [leet, setLeet] = useState(null)
  const [hub, setHub] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12000)

    const load = async () => {
      try {
        const [solvedRes, ghRes, reposRes] = await Promise.all([
          fetch(`https://alfa-leetcode-api.onrender.com/${LEETCODE_USER}/solved`, { signal: ctrl.signal }),
          fetch(`https://api.github.com/users/${GITHUB_USER}`, { signal: ctrl.signal }),
          fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`, { signal: ctrl.signal }),
        ])
        if (!alive) return
        let leetData = null
        if (solvedRes.ok) {
          const s = await solvedRes.json()
          const easy = s.easySolved ?? 0
          const medium = s.mediumSolved ?? 0
          const hard = s.hardSolved ?? 0
          leetData = { total: s.solvedProblem ?? easy + medium + hard, easy, medium, hard }
        }
        let hubData = null
        if (ghRes.ok) {
          const g = await ghRes.json()
          let langs = []
          if (reposRes.ok) langs = topLanguages(await reposRes.json())
          hubData = { repos: g.public_repos ?? 0, langs }
        }
        if (!leetData && !hubData) { setFailed(true); return }
        setLeet(leetData)
        setHub(hubData)
      } catch {
        if (alive) setFailed(true)
      } finally {
        clearTimeout(timer)
      }
    }
    load()
    return () => { alive = false; clearTimeout(timer); ctrl.abort() }
  }, [])

  if (failed) return null

  const segs = leet && leet.total > 0
    ? [
        { cls: 'easy', w: (leet.easy / leet.total) * 100 },
        { cls: 'medium', w: (leet.medium / leet.total) * 100 },
        { cls: 'hard', w: (leet.hard / leet.total) * 100 },
      ]
    : null

  return (
    <section className="stats-strip" aria-label="Coding activity">
      <div className="stats-inner">
        <a
          className="stat-card"
          href={`https://leetcode.com/u/${LEETCODE_USER}/`}
          target="_blank" rel="noreferrer"
        >
          <span className="stat-label"><CodeIcon /> LeetCode · {LEETCODE_USER}</span>
          <span className="stat-big">{leet ? leet.total : '…'} <small>problems solved</small></span>
          {segs ? (
            <>
              <span className="stat-bar" aria-hidden="true">
                {segs.map((s, i) => (
                  <span key={i} className={s.cls} style={{ width: `${s.w}%` }} />
                ))}
              </span>
              <span className="stat-split">
                <span className="easy">{leet.easy} easy</span>
                <span className="medium">{leet.medium} medium</span>
                <span className="hard">{leet.hard} hard</span>
              </span>
            </>
          ) : (
            <span className="stat-sub">loading…</span>
          )}
        </a>
        <a
          className="stat-card"
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank" rel="noreferrer"
        >
          <span className="stat-label"><GithubIcon /> GitHub · @{GITHUB_USER}</span>
          <span className="stat-big">{hub ? hub.repos : '…'} <small>public repos</small></span>
          {hub && hub.langs.length > 0 ? (
            <span className="stat-chips">
              {hub.langs.map((l) => (
                <span key={l} className="stat-chip">{l}</span>
              ))}
            </span>
          ) : (
            <span className="stat-sub">loading…</span>
          )}
        </a>
      </div>
    </section>
  )
}
