import Link from 'next/link'
import { Users, Shield, Lock, Server, Eye, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Bezpečnost | TeamForge',
  description: 'Jak TeamForge chrání vaše data a zajišťuje bezpečnost platformy',
}

export default function SecurityPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Users className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                TeamForge
              </span>
            </Link>
            <Link href="/" className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Bezpečnost vašich dat
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Bezpečnost je pro nás priorita číslo jedna. Používáme nejmodernější technologie
            a osvědčené postupy k ochraně vašich dat a zajištění spolehlivosti platformy.
          </p>
        </div>
      </section>

      {/* Security Overview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Šifrování na všech úrovních</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Veškerá komunikace i uložená data jsou šifrována pomocí standardů AES-256 a TLS 1.3
              </p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Server className="w-6 h-6 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">EU datová centra</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Vaše data jsou uložena výhradně v evropských datových centrech (Frankfurt, Amsterdam)
              </p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">GDPR compliant</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Plně v souladu s nařízením GDPR a českými právními předpisy o ochraně osobních údajů
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Security Measures */}
      <section className="py-16 px-4 bg-white/50 dark:bg-neutral-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Bezpečnostní opatření</h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Komplexní přístup k ochraně vašich dat
            </p>
          </div>

          <div className="space-y-8">
            {/* Data Encryption */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Šifrování dat</h3>
                  <div className="prose prose-lg text-neutral-600 dark:text-neutral-400">
                    <p>
                      <strong>Šifrování při přenosu (Data in Transit):</strong>
                    </p>
                    <ul>
                      <li>TLS 1.3 pro veškerou komunikaci mezi prohlížečem a servery</li>
                      <li>HTTPS enforced - HTTP je automaticky přesměrován na HTTPS</li>
                      <li>Perfect Forward Secrecy (PFS) pro maximální ochranu</li>
                      <li>HSTS (HTTP Strict Transport Security) enabled</li>
                    </ul>
                    <p className="mt-4">
                      <strong>Šifrování uložených dat (Data at Rest):</strong>
                    </p>
                    <ul>
                      <li>AES-256 šifrování databází</li>
                      <li>Citlivá data (hesla, API klíče) šifrována samostatným klíčem</li>
                      <li>Šifrované zálohy s odděleným úložištěm klíčů</li>
                      <li>Automatická rotace šifrovacích klíčů každých 90 dnů</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication & Access Control */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-brand-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Autentizace a řízení přístupu</h3>
                  <div className="prose prose-lg text-neutral-600 dark:text-neutral-400">
                    <p>
                      <strong>Silná autentizace:</strong>
                    </p>
                    <ul>
                      <li>Minimální délka hesla 8 znaků, doporučeno 12+</li>
                      <li>Kontrola hesel proti databázi uniklých hesel (Have I Been Pwned)</li>
                      <li>Možnost dvoufaktorové autentizace (2FA) pomocí TOTP aplikací</li>
                      <li>Session tokens s krátkou životností (24 hodin)</li>
                      <li>Automatické odhlášení po 30 minutách nečinnosti</li>
                    </ul>
                    <p className="mt-4">
                      <strong>Řízení přístupu (RBAC):</strong>
                    </p>
                    <ul>
                      <li>Granulární role: Admin, Manager, Facilitátor, Viewer</li>
                      <li>Princip nejmenších nutných oprávnění (Least Privilege)</li>
                      <li>Audit log všech přístupů k citlivým datům</li>
                      <li>Okamžité odebrání přístupu při ukončení spolupráce</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Infrastructure Security */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Server className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Infrastruktura a hosting</h3>
                  <div className="prose prose-lg text-neutral-600 dark:text-neutral-400">
                    <p>
                      <strong>Cloud poskytovatelé:</strong>
                    </p>
                    <ul>
                      <li>
                        <strong>AWS (Amazon Web Services):</strong> EU region (Frankfurt) -
                        databáze, úložiště souborů
                      </li>
                      <li>
                        <strong>Vercel:</strong> Edge network pro rychlé načítání aplikace
                      </li>
                      <li>
                        Oba poskytovatelé certifikováni ISO 27001, SOC 2 Type II
                      </li>
                    </ul>
                    <p className="mt-4">
                      <strong>Síťová bezpečnost:</strong>
                    </p>
                    <ul>
                      <li>Web Application Firewall (WAF) pro ochranu před útoky</li>
                      <li>DDoS ochrana na úrovni infrastruktury</li>
                      <li>Rate limiting pro prevenci brute-force útoků</li>
                      <li>Automatická detekce a blokování podezřelého provozu</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Backup & Recovery */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Zálohy a obnova dat</h3>
                  <div className="prose prose-lg text-neutral-600 dark:text-neutral-400">
                    <p>
                      <strong>Strategie zálohování:</strong>
                    </p>
                    <ul>
                      <li>Automatické denní zálohy celé databáze (každý den ve 2:00 UTC)</li>
                      <li>Continuous backup s transaction log každých 5 minut</li>
                      <li>Zálohy uchovávány po dobu 30 dnů</li>
                      <li>Geograficky redundantní úložiště (kopie v jiném EU regionu)</li>
                      <li>Šifrované zálohy s odděleným správcem klíčů</li>
                    </ul>
                    <p className="mt-4">
                      <strong>Testování obnovy:</strong>
                    </p>
                    <ul>
                      <li>Pravidelné testy obnovy ze záloh (měsíčně)</li>
                      <li>RTO (Recovery Time Objective): 4 hodiny</li>
                      <li>RPO (Recovery Point Objective): 5 minut</li>
                      <li>Disaster Recovery plán testován kvartálně</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Monitoring */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Monitorování a incident response</h3>
                  <div className="prose prose-lg text-neutral-600 dark:text-neutral-400">
                    <p>
                      <strong>Bezpečnostní monitoring:</strong>
                    </p>
                    <ul>
                      <li>24/7 automatické monitorování bezpečnostních událostí</li>
                      <li>Real-time alerty při detekci podezřelé aktivity</li>
                      <li>Centralizované logování všech systémových událostí</li>
                      <li>Retention logů po dobu 1 roku pro forensní analýzu</li>
                    </ul>
                    <p className="mt-4">
                      <strong>Incident Response:</strong>
                    </p>
                    <ul>
                      <li>Dedikovaný Incident Response Team (IRT)</li>
                      <li>SLA pro reakci na kritické incidenty: 1 hodina</li>
                      <li>Transparentní komunikace s dotčenými zákazníky do 72 hodin</li>
                      <li>Post-incident analýza a nápravná opatření</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Certifications */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Compliance a certifikace</h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Splňujeme přísné bezpečnostní standardy a právní požadavky
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-2xl font-bold mb-4">GDPR (General Data Protection Regulation)</h3>
              <div className="prose prose-lg text-neutral-600 dark:text-neutral-400">
                <ul>
                  <li>Data Processing Addendum (DPA) dostupný na požádání</li>
                  <li>Pověřenec pro ochranu osobních údajů (DPO) jmenován</li>
                  <li>Privacy by Design a Privacy by Default principy</li>
                  <li>Právo na přístup, opravu, výmaz, přenositelnost dat</li>
                  <li>Data breach notification do 72 hodin</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold mb-4">ISO 27001 (v procesu certifikace)</h3>
              <div className="prose prose-lg text-neutral-600 dark:text-neutral-400">
                <ul>
                  <li>Information Security Management System (ISMS)</li>
                  <li>Pravidelné bezpečnostní audity (kvartálně)</li>
                  <li>Risk assessment a risk management framework</li>
                  <li>Security policies a procedures dokumentovány</li>
                  <li>Školení zaměstnanců v oblasti bezpečnosti</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold mb-4">SOC 2 Type II (plánováno 2026)</h3>
              <div className="prose prose-lg text-neutral-600 dark:text-neutral-400">
                <ul>
                  <li>Trust Service Criteria: Security, Availability, Confidentiality</li>
                  <li>Nezávislý audit bezpečnostních kontrol</li>
                  <li>Dokumentace procesů a kontrol</li>
                  <li>Continuous monitoring a reporting</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold mb-4">Další standardy</h3>
              <div className="prose prose-lg text-neutral-600 dark:text-neutral-400">
                <ul>
                  <li>
                    <strong>OWASP Top 10:</strong> Pravidelné testy zranitelností
                  </li>
                  <li>
                    <strong>PCI DSS:</strong> Platby zpracovány certifikovaným Stripe
                  </li>
                  <li>
                    <strong>ePrivacy Directive:</strong> Správa cookies a souhlasů
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Best Practices for Users */}
      <section className="py-16 px-4 bg-white/50 dark:bg-neutral-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Doporučení pro uživatele</h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Jak můžete vy sami přispět k bezpečnosti vašeho účtu
            </p>
          </div>

          <div className="card">
            <div className="prose prose-lg max-w-none">
              <h3>1. Používejte silné, unikátní heslo</h3>
              <ul>
                <li>Minimálně 12 znaků (čím delší, tím lepší)</li>
                <li>Kombinace velkých a malých písmen, číslic a speciálních znaků</li>
                <li>Nepoužívejte stejné heslo jako na jiných službách</li>
                <li>Doporučujeme použít správce hesel (1Password, Bitwarden, LastPass)</li>
              </ul>

              <h3>2. Aktivujte dvoufaktorovou autentizaci (2FA)</h3>
              <ul>
                <li>Nastavení → Bezpečnost → Povolit 2FA</li>
                <li>Použijte TOTP aplikaci (Google Authenticator, Authy, Microsoft Authenticator)</li>
                <li>Uložte záložní kódy na bezpečné místo</li>
              </ul>

              <h3>3. Pravidelně kontrolujte přihlášení</h3>
              <ul>
                <li>Nastavení → Bezpečnost → Aktivní relace</li>
                <li>Zkontrolujte, zda všechna přihlášení jsou vaše</li>
                <li>Odhlaste podezřelé relace</li>
              </ul>

              <h3>4. Buďte opatrní s phishingem</h3>
              <ul>
                <li>TeamForge nikdy nepožaduje heslo e-mailem</li>
                <li>Vždy ověřte URL adresu (teamforge.cz)</li>
                <li>Podezřelé e-maily nahlaste na security@teamforge.cz</li>
              </ul>

              <h3>5. Udržujte software aktuální</h3>
              <ul>
                <li>Pravidelně aktualizujte prohlížeč</li>
                <li>Používejte aktuální operační systém</li>
                <li>Mějte aktivní antivirus</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vulnerability Disclosure */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="card bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Našli jste bezpečnostní chybu?</h2>
              <p className="text-xl mb-6 opacity-90">
                Bereme bezpečnost vážně a oceňujeme pomoc bezpečnostní komunity.
                Pokud jste objevili zranitelnost, prosím nahlaste ji zodpovědně.
              </p>
              <div className="prose prose-lg text-white/90 max-w-3xl mx-auto mb-8">
                <p>
                  <strong>Responsible Disclosure Policy:</strong>
                </p>
                <ul className="text-left">
                  <li>Zašlete detaily na <strong>security@teamforge.cz</strong> (PGP klíč k dispozici)</li>
                  <li>Nepublikujte zranitelnost veřejně do vyřešení</li>
                  <li>Garantujeme odpověď do 48 hodin</li>
                  <li>Kritické chyby opravíme do 7 dnů</li>
                  <li>Bug bounty program v přípravě (2026)</li>
                </ul>
              </div>
              <a
                href="mailto:security@teamforge.cz"
                className="inline-block bg-white text-brand-600 dark:text-brand-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold py-3 px-8 rounded-lg transition-colors shadow-md"
              >
                Nahlásit bezpečnostní problém
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Security Updates */}
      <section className="py-16 px-4 bg-white/50 dark:bg-neutral-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Zůstaňte informováni</h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Přihlaste se k odběru bezpečnostních oznámení a aktualizací
            </p>
          </div>

          <div className="card text-center max-w-2xl mx-auto">
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Bezpečnostní bulletin zasíláme pouze v případě důležitých aktualizací
              nebo incidentů, které by mohly ovlivnit vaše data. Žádný spam, jen
              relevantní informace.
            </p>
            <Link href="/admin/settings" className="btn-primary inline-flex items-center gap-2">
              Nastavit notifikace
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <h2 className="text-3xl font-bold mb-6 text-center">Kontakt na bezpečnostní tým</h2>
            <div className="prose prose-lg max-w-none text-center">
              <p>
                Máte dotazy ohledně bezpečnosti TeamForge? Kontaktujte náš bezpečnostní tým:
              </p>
              <ul className="list-none pl-0">
                <li>
                  <strong>E-mail:</strong> <a href="mailto:security@teamforge.cz">security@teamforge.cz</a>
                </li>
                <li>
                  <strong>PGP klíč:</strong> <a href="/pgp-key.txt">Stáhnout veřejný klíč</a>
                </li>
                <li>
                  <strong>Response time:</strong> Do 48 hodin (kritické incidenty do 1 hodiny)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                <span className="text-xl font-bold">TeamForge</span>
              </div>
              <p className="text-neutral-400 dark:text-neutral-500 text-sm">
                AI-powered team building management pro firemní poskytovatele
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-neutral-400 dark:text-neutral-500">
                <li><Link href="/#features" className="hover:text-white">Funkce</Link></li>
                <li><Link href="/#ai-powered" className="hover:text-white">AI nástroje</Link></li>
                <li><Link href="/#pricing" className="hover:text-white">Ceník</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Společnost</h4>
              <ul className="space-y-2 text-sm text-neutral-400 dark:text-neutral-500">
                <li><Link href="/about" className="hover:text-white">O nás</Link></li>
                <li><Link href="/contact" className="hover:text-white">Kontakt</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Právní informace</h4>
              <ul className="space-y-2 text-sm text-neutral-400 dark:text-neutral-500">
                <li><Link href="/privacy" className="hover:text-white">Ochrana osobních údajů</Link></li>
                <li><Link href="/terms" className="hover:text-white">Obchodní podmínky</Link></li>
                <li><Link href="/security" className="hover:text-white">Bezpečnost</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            © 2025 TeamForge. Součást platformy VertiGo SaaS.
          </div>
        </div>
      </footer>
    </div>
  )
}
