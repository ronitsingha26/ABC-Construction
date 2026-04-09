import { Navbar } from '../sections/Navbar'
import { Hero } from '../sections/Hero'
import { About } from '../sections/About'
import { Services } from '../sections/Services'
import { ProjectsShowcase } from '../sections/ProjectsShowcase'
import { StatsBand } from '../sections/StatsBand'
import { WhyChooseUs } from '../sections/WhyChooseUs'
import { Testimonials } from '../sections/Testimonials'
import { Team } from '../sections/Team'
import { ProcessTimeline } from '../sections/ProcessTimeline'
import { CTABanner } from '../sections/CTABanner'
import { Contact } from '../sections/Contact'
import { Footer } from '../sections/Footer'
import { useEffect } from 'react'
import { applyThemeTemporary } from '../lib/theme'

export function LandingPage() {
  useEffect(() => {
    const prev = document.documentElement.dataset.theme
    applyThemeTemporary('dark')
    return () => {
      applyThemeTemporary(prev === 'light' ? 'light' : 'dark')
    }
  }, [])

  return (
    <div className="bg-bg text-text">
      <Navbar />
      <main>
        <Hero />
        <div className="h-20" />
        <About />
        <Services />
        <ProjectsShowcase />
        <StatsBand />
        <WhyChooseUs />
        <Testimonials />
        <Team />
        <ProcessTimeline />
        <CTABanner />
        <Contact />
        <Footer />
      </main>
    </div>
  )
}

