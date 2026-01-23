import { Metadata } from 'next'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import ContactForm from '@/components/forms/ContactForm'
import { CONTACT_INFO, SOCIAL_LINKS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktujte Divadlo Studna. Telefonní čísla, e-mailové adresy a adresa sídla.',
}

export default function KontaktPage() {
  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Máte dotaz? Rádi odpovíme
          </h1>
          <p className="text-lg text-neutral-gray-200 max-w-3xl">
            Nevíte si rady s výběrem? Máte technický dotaz? Nebo chcete navázat
            spolupráci? Napište nám, rádi pomůžeme.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Cards */}
          <div className="space-y-6">
            {/* Produkce */}
            <Card>
              <h3 className="text-xl font-bold text-white mb-4">
                📞 Produkce
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-neutral-gray-200 mb-1">Jméno</div>
                  <div className="font-semibold text-white">
                    Klaudie Kašparová
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-gray-200 mb-1">Telefon</div>
                  <a
                    href={`tel:${CONTACT_INFO.phones.production.replace(/\s/g, '')}`}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    {CONTACT_INFO.phones.production}
                  </a>
                </div>
                <div>
                  <div className="text-sm text-neutral-gray-200 mb-1">E-mail</div>
                  <a
                    href={`mailto:${CONTACT_INFO.emails.production}`}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    {CONTACT_INFO.emails.production}
                  </a>
                </div>
              </div>
            </Card>

            {/* Ředitel */}
            <Card>
              <h3 className="text-xl font-bold text-white mb-4">
                🎭 Ředitel
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-neutral-gray-200 mb-1">Jméno</div>
                  <div className="font-semibold text-white">Pepíno Kašpar</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-gray-200 mb-1">Telefon</div>
                  <a
                    href={`tel:${CONTACT_INFO.phones.director.replace(/\s/g, '')}`}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    {CONTACT_INFO.phones.director}
                  </a>
                </div>
                <div>
                  <div className="text-sm text-neutral-gray-200 mb-1">E-mail</div>
                  <a
                    href={`mailto:${CONTACT_INFO.emails.director}`}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    {CONTACT_INFO.emails.director}
                  </a>
                </div>
              </div>
            </Card>

            {/* Sídlo */}
            <Card>
              <h3 className="text-xl font-bold text-white mb-4">
                🏠 Sídlo společnosti
              </h3>
              <address className="not-italic space-y-2 text-neutral-gray-200">
                <p>{CONTACT_INFO.address}</p>
                <div className="pt-3 border-t border-neutral-gray-600">
                  <div className="text-sm text-neutral-gray-200">IČO</div>
                  <div className="font-semibold">{CONTACT_INFO.ico}</div>
                </div>
              </address>
            </Card>

            {/* Social */}
            <Card className="bg-gradient-to-br from-primary-light/10 to-secondary/10">
              <h3 className="text-xl font-bold text-white mb-4">
                👋 Sledujte nás
              </h3>
              <div className="flex gap-4">
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </a>
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            {/* Order CTA Box */}
            <Card className="mb-6 bg-gradient-to-br from-primary/20 to-primary-dark/20 border-primary/30">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎭</div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2">Chcete nás pozvat?</h4>
                  <p className="text-sm text-neutral-gray-200 mb-3">
                    Pro objednávku představení vyberte z našeho repertoáru a klikněte
                    na &quot;Pozvěte nás k vám&quot;. Do 24 hodin vám pošleme nabídku.
                  </p>
                  <a
                    href="/repertoar"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm"
                  >
                    Prohlédnout repertoár →
                  </a>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-2xl font-bold text-white mb-6">
                Napište nám
              </h3>
              <ContactForm />
            </Card>

            {/* Quick Tips */}
            <Card className="mt-6 bg-neutral-gray-800/50">
              <h4 className="font-bold text-white mb-3">💬 Kdy nám napsat?</h4>
              <ul className="text-sm text-neutral-gray-200 space-y-2">
                <li>• Nevíte, které představení vybrat pro vaši akci</li>
                <li>• Potřebujete zjistit technické požadavky</li>
                <li>• Máte zájem o spolupráci nebo workshop</li>
                <li>• Cokoliv dalšího, co vás zajímá</li>
              </ul>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}
