'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { OrganizerOrderForm } from '@/components/order/OrganizerOrderForm'
import {
  Theater,
  Send,
  Sparkles,
  Check,
  ChevronRight,
  Building2,
  Zap,
  Car,
  Clock,
  School,
  Baby,
  Landmark,
  PartyPopper,
  ChevronDown
} from 'lucide-react'

// Step data for the interactive timeline
const steps = [
  {
    number: 1,
    title: 'Vyberte představení',
    description: 'Prohlédněte si náš repertoár a vyberte představení, které vás zaujme',
    icon: Theater,
    href: '/repertoar',
    color: 'from-primary to-orange-500',
  },
  {
    number: 2,
    title: 'Pošlete poptávku',
    description: 'Vyplňte jednoduchý formulář s termínem a místem konání',
    icon: Send,
    href: '#formular',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: 3,
    title: 'Připravíme vše',
    description: 'Přijedeme včas, postavíme jeviště a zahrajeme skvělé představení',
    icon: Sparkles,
    href: null,
    color: 'from-green-500 to-emerald-500',
  },
]

// What we provide
const weProvide = [
  'Kompletní divadelní produkci včetně loutek a rekvizit',
  'Stavbu a následný rozklad jeviště',
  'Profesionální herce a loutkáře',
  'Zvukovou a světelnou techniku (pokud je potřeba)',
  'Flexibilitu v přizpůsobení prostoru',
  'Možnost úpravy délky představení',
]

// Requirements accordion data
const requirements = [
  {
    id: 'space',
    icon: Building2,
    title: 'Prostor',
    content: 'Minimální rozměry závisí na konkrétním představení (obvykle 3×4 m). Detaily najdete u každého představení v repertoáru.',
  },
  {
    id: 'electricity',
    icon: Zap,
    title: 'Elektřina',
    content: 'Běžná zásuvka 220V (u některých představení 380V). Specifikace je uvedena u každého představení.',
  },
  {
    id: 'parking',
    icon: Car,
    title: 'Parkování',
    content: 'Možnost zaparkovat dodávku v blízkosti místa konání pro nakládku a vykládku materiálu.',
  },
  {
    id: 'time',
    icon: Clock,
    title: 'Čas na přípravu',
    content: 'Obvykle potřebujeme 60-90 minut před začátkem představení na stavbu jeviště a přípravu. Po představení pak 30-60 minut na rozklad.',
  },
]

// Audience types
const audiences = [
  { icon: School, label: 'Základní školy', delay: '0ms' },
  { icon: Baby, label: 'Mateřské školy', delay: '100ms' },
  { icon: Landmark, label: 'Kulturní domy', delay: '200ms' },
  { icon: PartyPopper, label: 'Festivaly', delay: '300ms' },
]

// Step Card Component
function StepCard({ step, isLast }: { step: typeof steps[0]; isLast: boolean }) {
  const Icon = step.icon
  const isAnchor = step.href?.startsWith('#')

  const handleClick = () => {
    if (isAnchor && step.href) {
      const element = document.querySelector(step.href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const cardClasses = `block relative bg-neutral-gray-800/50 backdrop-blur-sm border border-neutral-gray-600/50 rounded-2xl p-6 transition-all duration-500 ${
    step.href
      ? 'cursor-pointer hover:bg-neutral-gray-800/80 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2'
      : 'cursor-default'
  }`

  const cardContent = (
    <>
      {/* Gradient glow on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      {/* Number badge */}
      <div className="relative flex justify-center mb-6">
        <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${step.color} p-[2px] transition-transform duration-500 group-hover:scale-110`}>
          <div className="w-full h-full rounded-full bg-neutral-gray-900 flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
          {/* Animated ring */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500`} />
        </div>
        {/* Step number */}
        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
          {step.number}
        </div>
      </div>

      {/* Content */}
      <div className="relative text-center">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-light transition-colors duration-300">
          {step.title}
        </h3>
        <p className="text-neutral-gray-300 text-sm leading-relaxed">
          {step.description}
        </p>

        {/* Action indicator */}
        {step.href && (
          <div className="mt-4 flex items-center justify-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span className="text-sm font-medium">
              {step.href === '#formular' ? 'Přejít k formuláři' : 'Zobrazit repertoár'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="relative flex-1 group">
      {/* Connecting line */}
      {!isLast && (
        <div className="hidden md:block absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5">
          <div className="h-full bg-gradient-to-r from-neutral-gray-600 via-neutral-gray-500 to-neutral-gray-600 opacity-50" />
          <div className="absolute inset-0 h-full bg-gradient-to-r from-primary/50 to-primary-light/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
      )}

      {step.href && !isAnchor ? (
        <Link href={step.href} className={cardClasses}>
          {cardContent}
        </Link>
      ) : step.href && isAnchor ? (
        <button onClick={handleClick} className={cardClasses}>
          {cardContent}
        </button>
      ) : (
        <div className={cardClasses}>
          {cardContent}
        </div>
      )}
    </div>
  )
}

// Accordion Item Component
function AccordionItem({ item, isOpen, onToggle }: {
  item: typeof requirements[0]
  isOpen: boolean
  onToggle: () => void
}) {
  const Icon = item.icon

  return (
    <div className="border-b border-neutral-gray-700/50 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 py-4 text-left transition-colors duration-200 hover:bg-neutral-gray-700/20 px-4 -mx-4 rounded-lg"
      >
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'scale-110' : ''}`}>
          <Icon className="w-5 h-5 text-primary-light" />
        </div>
        <span className="flex-1 font-semibold text-white">{item.title}</span>
        <ChevronDown className={`w-5 h-5 text-neutral-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-neutral-gray-300 pl-14 pr-4">
          {item.content}
        </p>
      </div>
    </div>
  )
}

// Audience Card Component
function AudienceCard({ item }: { item: typeof audiences[0] }) {
  const Icon = item.icon

  return (
    <div
      className="group relative bg-neutral-gray-800/50 backdrop-blur-sm border border-neutral-gray-600/50 rounded-xl p-6 transition-all duration-500 hover:bg-neutral-gray-800/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
      style={{ animationDelay: item.delay }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-neutral-gray-700 to-neutral-gray-800 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="w-8 h-8 text-primary-light transition-colors duration-300" />
        </div>
        <div className="font-semibold text-white group-hover:text-primary-light transition-colors duration-300">
          {item.label}
        </div>
      </div>
    </div>
  )
}

export default function ProPoradatelePage() {
  const [openAccordion, setOpenAccordion] = useState<string | null>('space')

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
            Informace pro{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
              pořadatele
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-gray-300 max-w-3xl mx-auto leading-relaxed">
            Přivezeme vám profesionální divadelní představení přímo k vám.
            Hrajeme pro školy, mateřinky, kulturní domy i soukromé akce.
          </p>
        </div>

        {/* Interactive Steps */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-10 text-center">
            Jak objednat představení
          </h2>
          <div className="flex flex-col md:flex-row gap-6 md:gap-4">
            {steps.map((step, index) => (
              <StepCard
                key={step.number}
                step={step}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
        </section>

        {/* What we provide */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8 text-center">
            Co zajišťujeme my
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {weProvide.map((item, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 p-4 rounded-xl bg-neutral-gray-800/30 border border-transparent hover:border-primary/20 hover:bg-neutral-gray-800/50 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mt-0.5 transition-transform duration-300 group-hover:scale-110">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-neutral-gray-200 group-hover:text-white transition-colors duration-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements Accordion */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8 text-center">
            Co potřebujeme od vás
          </h2>
          <div className="max-w-2xl mx-auto">
            <Card className="bg-neutral-gray-800/50 backdrop-blur-sm border-neutral-gray-600/50">
              {requirements.map((item) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openAccordion === item.id}
                  onToggle={() => setOpenAccordion(openAccordion === item.id ? null : item.id)}
                />
              ))}
            </Card>
          </div>
        </section>

        {/* Pricing Info */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8 text-center">
            Ceny a platební podmínky
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-primary-light/10 border border-primary/20 p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="relative">
                <p className="text-neutral-gray-200 mb-6 leading-relaxed">
                  Cena představení se liší podle typu produkce, vzdálenosti a dalších faktorů.
                  Pro konkrétní cenovou nabídku nás prosím kontaktujte s následujícími informacemi:
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    'Název zvoleného představení',
                    'Požadovaný termín a čas',
                    'Místo konání (adresa)',
                    'Předpokládaný počet diváků',
                    'Typ akce (škola, MŠ, festival, soukromá oslava...)',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-neutral-gray-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Link to pricing page */}
                <Link
                  href="/cenik"
                  className="group inline-flex items-center gap-2 mb-6 px-5 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-primary-light/20 border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                >
                  <span className="text-white font-medium">Zobrazit kompletní ceník</span>
                  <ChevronRight className="w-5 h-5 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-gray-800/50 border border-neutral-gray-700/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">💳</span>
                  </div>
                  <p className="text-sm text-neutral-gray-300">
                    <strong className="text-white">Platba:</strong> Faktura se splatností 14 dní.
                    Možnost platby v hotovosti nebo bankovním převodem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audience Types */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8 text-center">
            Pro koho hrajeme
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {audiences.map((item, index) => (
              <AudienceCard key={index} item={item} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-primary p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            <div className="relative bg-neutral-gray-900/95 rounded-[22px] p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Pozvěte nás k vám
              </h2>
              <p className="text-xl text-neutral-gray-300 mb-8 max-w-2xl mx-auto">
                Vyberte si představení a pošlete nám nezávaznou poptávku.
                Do 24 hodin vám připravíme nabídku na míru.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  href="/repertoar"
                  variant="primary"
                  size="lg"
                  className="group"
                >
                  <Theater className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                  Prohlédnout repertoár
                </Button>
                <Button
                  href="#formular"
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Poslat poptávku
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Order Form Section */}
        <section id="formular" className="scroll-mt-24">
          <Suspense fallback={
            <div className="bg-neutral-gray-800/50 rounded-xl p-6 md:p-8 text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-neutral-gray-700 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-neutral-gray-700 rounded w-2/3 mx-auto"></div>
              </div>
            </div>
          }>
            <OrganizerOrderForm />
          </Suspense>
        </section>
      </Container>

      {/* Custom styles for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  )
}
