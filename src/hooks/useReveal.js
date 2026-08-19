import { useEffect, useRef } from 'react'

// Attaches an IntersectionObserver to a ref and adds `.is-visible`
// to any descendant carrying the `data-reveal` attribute once it
// scrolls into view. One observer per section keeps things cheap.
export function useReveal() {
  const containerRef = useRef(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const targets = root.hasAttribute('data-reveal')
      ? [root, ...root.querySelectorAll('[data-reveal]')]
      : [...root.querySelectorAll('[data-reveal]')]

    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return containerRef
}
