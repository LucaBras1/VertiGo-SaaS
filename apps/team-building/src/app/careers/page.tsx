/**
 * Careers Page - Placeholder
 */

import Link from 'next/link'
import { ArrowLeft, Briefcase, MapPin, Clock, Users, Heart, Zap, Coffee } from 'lucide-react'

export const metadata = {
  title: 'Kariéra | TeamForge',
  description: 'Připojte se k našemu týmu a pomozte nám budovat lepší týmy po celém světě',
}

const benefits = [
  { icon: Heart, title: 'Zdravotní benefity', description: 'Multisport karta, sick days' },
  { icon: Zap, title: 'Flexibilní práce', description: 'Hybridní model, home office' },
  { icon: Coffee, title: 'Skvělá kultura', description: 'Team buildingy, společné akce' },
  { icon: Users, title: 'Růst a rozvoj', description: 'Vzdělávání, konference' },
]

const positions = [
  {
    id: 1,
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Praha / Remote',
    type: 'Plný úvazek',
    description: 'Hledáme zkušeného frontend developera se znalostí React a TypeScript.',
  },
  {
    id: 2,
    title: 'Sales Manager',
    department: 'Sales',
    location: 'Praha',
    type: 'Plný úvazek',
    description: 'Připojte se k našemu obchodnímu týmu a pomozte nám růst na českém trhu.',
  },
  {
    id: 3,
    title: 'Team Building Facilitátor',
    department: 'Operations',
    location: 'Česká republika',
    type: 'Částečný úvazek',
    description: 'Vedení a facilitace team buildingových aktivit pro naše klienty.',
  },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Zpět na hlavní stránku
          </Link>
          <Link href="/" className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            TeamForge
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Kariéra v TeamForge</h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Připojte se k týmu, který pomáhá firmám budovat silnější vztahy a lepší týmovou kulturu.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8 text-center">Proč pracovat s námi?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white dark:bg-neutral-950 rounded-xl p-6 shadow-lg text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">{benefit.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">Otevřené pozice</h2>

          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-6 text-white mb-8">
            <p className="text-lg">
              Aktuálně aktivně nehledáme nové kolegy, ale rádi se s vámi spojíme. Pošlete nám svůj životopis na{' '}
              <a href="mailto:careers@teamforge.cz" className="underline font-semibold">
                careers@teamforge.cz
              </a>
            </p>
          </div>

          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.id} className="bg-white dark:bg-neutral-950 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                      {position.department}
                    </span>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">{position.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">{position.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <button className="btn-primary whitespace-nowrap opacity-50 cursor-not-allowed" disabled>
                    Připravujeme
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto text-center bg-white dark:bg-neutral-950 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Nevidíte pozici pro vás?</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Pošlete nám svůj životopis a dejte nám vědět, čím byste mohli obohatit náš tým.
          </p>
          <a
            href="mailto:careers@teamforge.cz"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Briefcase className="w-5 h-5" />
            Napište nám
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-neutral-400 dark:text-neutral-500">&copy; 2025 TeamForge. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </div>
  )
}
