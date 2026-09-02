import React from 'react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span>© {new Date().getFullYear()} Ayush Mishra. Built with React.</span>
        <div className="footer__links">
          <a href="https://github.com/Ayushm28114" target="_blank" rel="noreferrer">GitHub</a>
          <a href="mailto:ayushm281104@gmail.com">Email</a>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  )
}
