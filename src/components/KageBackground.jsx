import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createWorld } from '../kage/world.js'

/**
 * KageBackground — fixed full-viewport night-temple world behind the portfolio.
 *
 * - Scroll drives one continuous camera path (composed shot per section).
 * - Pointer adds subtle parallax; click/tap releases a small ember burst.
 * - Dark theme: full world. Light theme: faded to a whisper via CSS opacity.
 * - Respects prefers-reduced-motion (renders a single static frame).
 * - Pauses when the tab is hidden; caps pixel ratio for performance.
 */
export default function KageBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 720px)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75))
    renderer.setSize(window.innerWidth, window.innerHeight)
    mount.appendChild(renderer.domElement)

    const world = createWorld({ mobile })
    world.setAspect(window.innerWidth, window.innerHeight)

    const view = { scrollT: 0, px: 0, py: 0 }
    let rafId = 0
    let running = true
    let last = performance.now()

    const readScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - window.innerHeight
      view.scrollT = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
    }
    readScroll()
    // Only animate while the hero is on screen. Past the hero the scene
    // freezes on its last frame (GPU idles); scrolling still nudges the
    // camera via a single catch-up frame in onScroll below.
    let heroVisible = true
    const heroEl = document.getElementById('top')
    const heroObserver = heroEl
    ? new IntersectionObserver(
        ([entry]) => {
            heroVisible = entry.isIntersecting
            if (heroVisible && !reducedMotion && !running && !document.hidden) {
            running = true
            last = performance.now()
            rafId = requestAnimationFrame(loop)
            }
        },
        { threshold: 0 }
        )
    : null
    if (heroObserver) heroObserver.observe(heroEl)


    const onScroll = () => {
    readScroll()
    // Loop parked past the hero: render one frame so the scroll-driven
    // camera stays in sync, then go back to sleep.
    if (reducedMotion || heroVisible || running || document.hidden) return
    const now = performance.now()
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    world.update(dt, now / 1000, view)
    renderer.render(world.scene, world.camera)
    }

    const onPointer = (e) => {
      // Fine pointers only — touch scroll shouldn't yank the camera.
      if (e.pointerType && e.pointerType !== 'mouse') return
      view.px = (e.clientX / window.innerWidth) * 2 - 1
      view.py = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onClick = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'touch') return
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -((e.clientY / window.innerHeight) * 2 - 1)
      world.burst(nx, ny)
    }
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      world.setAspect(window.innerWidth, window.innerHeight)
      if (reducedMotion) world.renderStatic(renderer, view.scrollT)
    }

    const loop = (now) => {
      if (!running) return
      if (!heroVisible) {
        running = false
        return
        }
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      world.update(dt, now / 1000, view)
      renderer.render(world.scene, world.camera)
      rafId = requestAnimationFrame(loop)
    }

    if (reducedMotion) {
      // One composed still frame; no animation loop.
      world.renderStatic(renderer, 0.12)
    } else {
      rafId = requestAnimationFrame(loop)
    }

    // Pause when the tab is hidden so we never burn GPU in the background.
    const onVisibility = () => {
      if (reducedMotion) return
      if (document.hidden) {
        running = false
        cancelAnimationFrame(rafId)
      } else if (!running && heroVisible) {
        running = true
        last = performance.now()
        rafId = requestAnimationFrame(loop)
      }
    }

    // Theme: fade the world in light mode so text stays readable.
    const applyTheme = () => {
      const dark = document.documentElement.getAttribute('data-theme') !== 'light'
      mount.style.opacity = dark ? '1' : '0.14'
    }
    applyTheme()
    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onClick, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      if (heroObserver) heroObserver.disconnect()
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onClick)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      themeObserver.disconnect()
      world.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <>
      <div ref={mountRef} className="kage-canvas" aria-hidden="true" />
      <div className="kage-scrim" aria-hidden="true" />
      <div className="kage-vignette" aria-hidden="true" />
      <div className="kage-grain" aria-hidden="true" />
    </>
  )
}
