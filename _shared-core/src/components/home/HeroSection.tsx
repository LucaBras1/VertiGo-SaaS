import Button from '@/components/ui/Button'
import Container from '@/components/ui/Container'

export default function HeroSection() {
  return (
    <section
      className="relative py-20 md:py-32"
      style={{
        background: 'radial-gradient(ellipse 900px 700px at top right, rgba(255, 68, 68, 0.3), rgba(255, 213, 79, 0.15) 30%, rgba(0, 0, 0, 1) 65%)'
      }}
    >
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-gray-800 rounded-full shadow-base mb-6 border border-neutral-gray-600">
              <span className="text-2xl">🎭</span>
              <span className="text-sm font-semibold text-white">
                Od roku 1993 vozíme radost po celé ČR
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Přivezeme pohádku{' '}
              <span className="text-primary">až k vám</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-neutral-gray-200 mb-8 leading-relaxed">
              Loutkové divadlo plné kouzel, chůdová představení a hudební produkce.
              Přijedeme do vaší školy, školky, kulturáku nebo kamkoliv, kde chtějí
              děti zažít něco výjimečného.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/program" variant="primary" size="lg">
                Zobrazit program
              </Button>
              <Button href="/repertoar" variant="outline" size="lg">
                Prohlédnout repertoár
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 pt-12 border-t border-white/20">
              <div className="border border-white/15 rounded-lg p-4 md:p-6 hover:border-white/30 hover:shadow-lg hover:shadow-white/5 transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  30+
                </div>
                <div className="text-sm text-neutral-gray-200">let zkušeností</div>
              </div>
              <div className="border border-white/15 rounded-lg p-4 md:p-6 hover:border-white/30 hover:shadow-lg hover:shadow-white/5 transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  20+
                </div>
                <div className="text-sm text-neutral-gray-200">představení</div>
              </div>
              <div className="border border-white/15 rounded-lg p-4 md:p-6 hover:border-white/30 hover:shadow-lg hover:shadow-white/5 transition-all duration-300">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">
                  <span className="sm:hidden">200K+</span>
                  <span className="hidden sm:inline">200 000+</span>
                </div>
                <div className="text-sm text-neutral-gray-200">spokojených diváků</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
