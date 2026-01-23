import { Metadata } from 'next'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Ceník',
  description: 'Orientační ceník divadelních představení. Cena závisí na typu akce, vzdálenosti a termínu. Rádi vám připravíme nabídku na míru.',
}

const PRICE_TABLE = [
  {
    type: 'Mateřská škola',
    icon: '🧸',
    price: 'od 4 500 Kč',
    note: 'Představení do 45 min',
  },
  {
    type: 'Základní škola',
    icon: '🏫',
    price: 'od 5 500 Kč',
    note: 'Představení 45-60 min',
  },
  {
    type: 'Kulturní dům / Knihovna',
    icon: '🏛️',
    price: 'od 6 500 Kč',
    note: 'Veřejné představení',
  },
  {
    type: 'Festival / Městská akce',
    icon: '🎪',
    price: 'individuálně',
    note: 'Dle rozsahu akce',
  },
  {
    type: 'Soukromá oslava',
    icon: '🎂',
    price: 'od 7 000 Kč',
    note: 'Narozeniny, svatby aj.',
  },
]

const INCLUDED = [
  'Kompletní divadelní představení dle zvoleného titulu',
  'Profesionální herci a loutkáři',
  'Veškeré kulisy, loutky a rekvizity',
  'Zvuková a světelná technika (dle potřeby)',
  'Stavba a úklid jeviště',
  'Doprava v rámci Středočeského kraje',
]

const SURCHARGES = [
  {
    item: 'Víkend nebo svátek',
    value: '+20 %',
  },
  {
    item: 'Doprava nad 50 km',
    value: '+8 Kč/km',
  },
  {
    item: 'Druhé představení ve stejný den',
    value: '−30 %',
  },
]

export default function CenikPage() {
  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Kolik stojí divadelní zážitek?
          </h1>
          <p className="text-lg text-neutral-gray-200 max-w-2xl mx-auto">
            Cena představení závisí na několika věcech. Rádi vám připravíme
            nabídku přesně na míru vaší akci.
          </p>
        </div>

        {/* Factors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: '🎭', label: 'Typ představení' },
            { icon: '📍', label: 'Vzdálenost' },
            { icon: '👥', label: 'Počet diváků' },
            { icon: '📅', label: 'Termín' },
          ].map((factor) => (
            <div
              key={factor.label}
              className="bg-neutral-gray-800 rounded-lg p-4 text-center border border-neutral-gray-600"
            >
              <div className="text-3xl mb-2">{factor.icon}</div>
              <div className="text-sm text-neutral-gray-200">{factor.label}</div>
            </div>
          ))}
        </div>

        {/* Price Table */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-white mb-6 text-center">
            Orientační ceník
          </h2>
          <div className="overflow-hidden rounded-lg border border-neutral-gray-600">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-gray-800">
                  <th className="text-left py-4 px-6 text-neutral-gray-200 font-semibold">
                    Typ akce
                  </th>
                  <th className="text-right py-4 px-6 text-neutral-gray-200 font-semibold">
                    Cena
                  </th>
                </tr>
              </thead>
              <tbody>
                {PRICE_TABLE.map((row, index) => (
                  <tr
                    key={row.type}
                    className={`border-t border-neutral-gray-700 ${
                      index % 2 === 0 ? 'bg-neutral-gray-900' : 'bg-neutral-gray-800/50'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{row.icon}</span>
                        <div>
                          <div className="font-medium text-white">{row.type}</div>
                          <div className="text-sm text-neutral-gray-300">{row.note}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-lg font-semibold text-primary">
                        {row.price}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-neutral-gray-300 mt-4 text-center">
            * Ceny jsou orientační a mohou se lišit dle konkrétních podmínek.
            Závaznou cenu vám sdělíme v nabídce.
          </p>
        </section>

        {/* What's Included */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-white mb-6">
            Co je v ceně?
          </h2>
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INCLUDED.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-neutral-gray-200">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Surcharges */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-white mb-6">
            Příplatky a slevy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SURCHARGES.map((item) => (
              <Card key={item.item} className="text-center">
                <div
                  className={`text-2xl font-bold mb-2 ${
                    item.value.startsWith('−') ? 'text-green-500' : 'text-amber-500'
                  }`}
                >
                  {item.value}
                </div>
                <div className="text-neutral-gray-200">{item.item}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Payment Info */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-white mb-6">
            Platební podmínky
          </h2>
          <Card className="bg-neutral-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-xl">💳</span> Způsob platby
                </h4>
                <p className="text-neutral-gray-200">
                  Faktura se splatností 14 dní, bankovní převod nebo hotovost.
                  Pro školy a instituce možnost platby z rozpočtu.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-xl">📋</span> Smlouva
                </h4>
                <p className="text-neutral-gray-200">
                  Po odsouhlasení nabídky vám zašleme jednoduchou smlouvu
                  a po jejím podpisu rezervujeme termín.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Chcete přesnou kalkulaci?
          </h2>
          <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            Vyberte si představení a my vám do 24 hodin pošleme nezávaznou nabídku
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/repertoar"
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-neutral-100"
            >
              Prohlédnout repertoár
            </Button>
            <Button
              href="/kontakt"
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Mám dotaz k ceně
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
