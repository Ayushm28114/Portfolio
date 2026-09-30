import React, { Suspense } from 'react'
import { ThemeProvider } from './ThemeContext.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Experience from './components/Experience.jsx'
import Projects from './components/Projects.jsx'
import Skills from './components/Skills.jsx'
import Education from './components/Education.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

const KageBackground = React.lazy(() => import('./components/KageBackground.jsx'))

export default function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={null}>
        <KageBackground />
      </Suspense>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
    </ThemeProvider>
  )
}
