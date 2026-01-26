import Link from 'next/link'
import { Users, Target, Heart, Lightbulb, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'O společnosti | TeamForge',
  description: 'Poznámte tým za TeamForge - AI-powered platformou pro team building',
}

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Users className="w-8 h-8 text-brand-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                TeamForge
              </span>
            </Link>
            <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-brand-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            O TeamForge
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Jsme tým vývojářů, designérů a odborníků na firemní kulturu, kteří věří,
            že technologie a umělá inteligence mohou revolucionalizovat způsob, jakým
            společnosti budují své týmy.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-brand-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Naše mise</h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  TeamForge vznikl s jednoduchou, ale ambiciózní misí: zpřístupnit
                  pokročilé AI nástroje všem poskytovatelům team building aktivit,
                  bez ohledu na jejich velikost.
                </p>
                <p>
                  Chceme, aby každý facilitátor mohl nabídnout svým klientům profesionální
                  služby na úrovni velkých korporátních agentur - od přesného párování
                  aktivit s cíli až po automatické generování HR reportů.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-brand-secondary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Naše vize</h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  Věříme, že budoucnost team buildingu leží v personalizaci a datově
                  podložených rozhodnutích. AI není jen buzzword - je to nástroj, který
                  umožňuje facilitátorům věnovat více času tomu, co skutečně umí nejlépe:
                  práci s lidmi.
                </p>
                <p>
                  Naší vizí je svět, kde každá firma má přístup k team building aktivitám,
                  které jsou přesně cílené, měřitelné, a které skutečně posouvají týmy vpřed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Naše hodnoty</h2>
            <p className="text-xl text-gray-600">
              Principy, kterými se řídíme při vývoji TeamForge
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lidé na prvním místě</h3>
              <p className="text-gray-600">
                Technologie má lidem sloužit, ne naopak. Vyvíjíme nástroje, které
                zjednodušují práci a umožňují facilitátorům soustředit se na to podstatné.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparentnost</h3>
              <p className="text-gray-600">
                Věříme v otevřenou komunikaci. Naše AI algoritmy jsou vysvětlitelné,
                ceny jasné, a vždy víte, jak vaše data používáme.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Kvalita výsledků</h3>
              <p className="text-gray-600">
                Nezaměřujeme se na rychlá řešení, ale na dlouhodobě udržitelné výsledky,
                které skutečně přináší hodnotu vašim klientům.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section (Placeholder) */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Náš tým</h2>
            <p className="text-xl text-gray-600">
              Jsme multidisciplinární tým odborníků ze světa technologií, HR a team buildingu
            </p>
          </div>

          <div className="card text-center py-12">
            <Users className="w-16 h-16 text-brand-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Spojte se s námi</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Chcete se dozvědět více o lidech za TeamForge? Napište nám a rádi vám
              představíme náš tým a ukážeme, jak můžeme pomoci vašemu team building byznysu.
            </p>
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              Kontaktujte nás
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Připraveni vyzkoušet TeamForge?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Začněte s 14denní zkušební verzí zdarma. Žádná platební karta není potřeba.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white text-brand-primary hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg">
              Začít zdarma
            </Link>
            <Link href="/demo" className="border-2 border-white text-white hover:bg-white hover:text-brand-primary font-semibold py-3 px-8 rounded-lg transition-all">
              Shlédnout demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-brand-primary" />
                <span className="text-xl font-bold">TeamForge</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered team building management pro firemní poskytovatele
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/#features" className="hover:text-white">Funkce</Link></li>
                <li><Link href="/#ai-powered" className="hover:text-white">AI nástroje</Link></li>
                <li><Link href="/#pricing" className="hover:text-white">Ceník</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Společnost</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">O nás</Link></li>
                <li><Link href="/contact" className="hover:text-white">Kontakt</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Právní informace</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Ochrana osobních údajů</Link></li>
                <li><Link href="/terms" className="hover:text-white">Obchodní podmínky</Link></li>
                <li><Link href="/security" className="hover:text-white">Bezpečnost</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 TeamForge. Součást platformy VertiGo SaaS.
          </div>
        </div>
      </footer>
    </div>
  )
}
