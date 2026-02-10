import Link from 'next/link'
import { Users, Shield, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Zásady ochrany osobních údajů | TeamForge',
  description: 'Zásady ochrany osobních údajů TeamForge v souladu s GDPR',
}

export default function PrivacyPage() {
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
            Zásady ochrany osobních údajů
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Poslední aktualizace: 23. ledna 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <article className="prose prose-lg max-w-none">
              <h2>1. Úvod</h2>
              <p>
                Vítejte v TeamForge. Ochrana vašich osobních údajů je pro nás prioritou.
                Tyto zásady popisují, jaké údaje shromažďujeme, jak je používáme a jaká
                máte práva v souvislosti s těmito údaji.
              </p>
              <p>
                TeamForge je provozován společností VertiGo SaaS, IČO: XXXXXXXX, se sídlem
                v [Adresa]. Jako správce osobních údajů postupujeme v souladu s nařízením
                GDPR (EU) 2016/679.
              </p>

              <h2>2. Jaké osobní údaje sbíráme</h2>
              <p>
                V rámci provozu platformy TeamForge shromažďujeme následující kategorie
                osobních údajů:
              </p>

              <h3>2.1 Údaje poskytnuté přímo vámi</h3>
              <ul>
                <li>
                  <strong>Registrační údaje:</strong> Jméno, příjmení, e-mailová adresa,
                  telefonní číslo, název společnosti
                </li>
                <li>
                  <strong>Fakturační údaje:</strong> IČO, DIČ, adresa sídla společnosti,
                  bankovní spojení
                </li>
                <li>
                  <strong>Obsah vytvořený vámi:</strong> Programy, aktivity, klienti,
                  poznámky k sezeními, reporty
                </li>
              </ul>

              <h3>2.2 Automaticky shromažďované údaje</h3>
              <ul>
                <li>
                  <strong>Technické údaje:</strong> IP adresa, typ prohlížeče, operační systém,
                  časové pásmo
                </li>
                <li>
                  <strong>Údaje o používání:</strong> Přihlášení, zobrazené stránky, kliknutí,
                  čas strávený v aplikaci
                </li>
                <li>
                  <strong>Cookies:</strong> Viz sekce 4 níže
                </li>
              </ul>

              <h2>3. Jak osobní údaje používáme</h2>
              <p>
                Vaše osobní údaje používáme pro následující účely:
              </p>

              <h3>3.1 Poskytování služby</h3>
              <ul>
                <li>Vytvoření a správa vašeho účtu</li>
                <li>Umožnění přístupu k funkcím platformy</li>
                <li>Zpracování plateb a vystavování faktur</li>
                <li>Poskytování zákaznické podpory</li>
              </ul>

              <h3>3.2 Zlepšování služby</h3>
              <ul>
                <li>Analýza používání platformy pro zlepšení uživatelského zážitku</li>
                <li>Trénování AI modelů (anonymizovaná data)</li>
                <li>Detekce a prevence zneužití služby</li>
              </ul>

              <h3>3.3 Komunikace</h3>
              <ul>
                <li>Zasílání důležitých upozornění o službě</li>
                <li>Odpovědi na vaše dotazy a požadavky</li>
                <li>Marketingová komunikace (pouze s vaším souhlasem)</li>
              </ul>

              <h3>3.4 Právní základ zpracování</h3>
              <ul>
                <li>
                  <strong>Plnění smlouvy:</strong> Poskytování služby, fakturace
                </li>
                <li>
                  <strong>Oprávněný zájem:</strong> Zlepšování služby, bezpečnost
                </li>
                <li>
                  <strong>Souhlas:</strong> Marketingová komunikace, analytické cookies
                </li>
                <li>
                  <strong>Právní povinnost:</strong> Účetnictví, archivace
                </li>
              </ul>

              <h2>4. Cookies a podobné technologie</h2>
              <p>
                TeamForge používá cookies pro zajištění správného fungování platformy
                a zlepšení uživatelského zážitku.
              </p>

              <h3>4.1 Nezbytné cookies</h3>
              <p>
                Tyto cookies jsou nutné pro fungování platformy (přihlášení, bezpečnost).
                Nelze je odmítnout.
              </p>

              <h3>4.2 Analytické cookies</h3>
              <p>
                Pomáhají nám pochopit, jak návštěvníci používají web. Používáme anonymizované
                údaje z Google Analytics.
              </p>

              <h3>4.3 Správa cookies</h3>
              <p>
                Nastavení cookies můžete kdykoliv změnit v nastavení prohlížeče nebo
                v sekci Nastavení → Soukromí v aplikaci.
              </p>

              <h2>5. Sdílení osobních údajů</h2>
              <p>
                Vaše osobní údaje nesdílíme s třetími stranami, kromě následujících případů:
              </p>

              <h3>5.1 Poskytovatelé služeb</h3>
              <ul>
                <li>
                  <strong>Hosting:</strong> Vercel, AWS (data center v EU)
                </li>
                <li>
                  <strong>Platby:</strong> Stripe (pouze fakturační údaje)
                </li>
                <li>
                  <strong>E-mail:</strong> SendGrid (pouze e-mailové adresy)
                </li>
                <li>
                  <strong>Analytika:</strong> Google Analytics (anonymizované IP)
                </li>
              </ul>

              <h3>5.2 Právní požadavky</h3>
              <p>
                Můžeme zveřejnit údaje, pokud to vyžaduje zákon nebo soudní příkaz.
              </p>

              <h2>6. Uchování osobních údajů</h2>
              <p>
                Vaše osobní údaje uchováváme po dobu nezbytnou pro poskytování služby
                a splnění právních povinností:
              </p>
              <ul>
                <li>
                  <strong>Aktivní účet:</strong> Po celou dobu trvání účtu
                </li>
                <li>
                  <strong>Po zrušení účtu:</strong> 30 dnů (možnost obnovení)
                </li>
                <li>
                  <strong>Fakturační údaje:</strong> 10 let (daňové předpisy)
                </li>
                <li>
                  <strong>Marketingový souhlas:</strong> Do odvolání souhlasu
                </li>
              </ul>

              <h2>7. Vaše práva</h2>
              <p>
                V souladu s GDPR máte následující práva:
              </p>

              <h3>7.1 Právo na přístup</h3>
              <p>
                Máte právo získat potvrzení, zda zpracováváme vaše údaje, a kopii těchto údajů.
              </p>

              <h3>7.2 Právo na opravu</h3>
              <p>
                Můžete požádat o opravu nepřesných nebo neúplných údajů.
              </p>

              <h3>7.3 Právo na výmaz (&quot;právo být zapomenut&quot;)</h3>
              <p>
                Můžete požádat o smazání vašich osobních údajů, pokud již nejsou potřebné
                pro účely, pro které byly shromážděny.
              </p>

              <h3>7.4 Právo na omezení zpracování</h3>
              <p>
                Můžete požádat o omezení zpracování vašich údajů v určitých případech.
              </p>

              <h3>7.5 Právo na přenositelnost</h3>
              <p>
                Máte právo získat vaše údaje ve strukturovaném, běžně používaném formátu
                (JSON, CSV) a přenést je k jinému poskytovateli.
              </p>

              <h3>7.6 Právo vznést námitku</h3>
              <p>
                Můžete vznést námitku proti zpracování vašich údajů pro účely přímého marketingu.
              </p>

              <h3>7.7 Právo odvolat souhlas</h3>
              <p>
                Pokud je zpracování založeno na souhlasu, můžete jej kdykoliv odvolat.
              </p>

              <h3>7.8 Jak uplatnit svá práva</h3>
              <p>
                Pro uplatnění kteréhokoliv z těchto práv nás kontaktujte na
                e-mailu <a href="mailto:privacy@teamforge.cz">privacy@teamforge.cz</a> nebo
                prostřednictvím sekce Nastavení → Soukromí v aplikaci.
              </p>

              <h2>8. Zabezpečení údajů</h2>
              <p>
                Používáme technická a organizační opatření k ochraně vašich osobních údajů:
              </p>
              <ul>
                <li>Šifrování přenosu dat (TLS 1.3)</li>
                <li>Šifrování citlivých dat v databázi (AES-256)</li>
                <li>Pravidelné bezpečnostní audity</li>
                <li>Omezený přístup zaměstnanců (need-to-know)</li>
                <li>Pravidelné zálohy s šifrováním</li>
              </ul>
              <p>
                Více informací o bezpečnosti najdete na stránce <Link href="/security" className="text-brand-600 dark:text-brand-400 hover:underline">Bezpečnost</Link>.
              </p>

              <h2>9. Mezinárodní přenosy dat</h2>
              <p>
                Vaše data jsou primárně uložena v datových centrech v EU (Frankfurt, Amsterdam).
                V případě přenosu mimo EU zajišťujeme adekvátní úroveň ochrany prostřednictvím
                standardních smluvních doložek schválených Evropskou komisí.
              </p>

              <h2>10. Práva dětí</h2>
              <p>
                TeamForge není určen pro osoby mladší 18 let. Pokud zjistíme, že jsme
                neúmyslně shromáždili údaje od dítěte mladšího 18 let, tyto údaje smažeme.
              </p>

              <h2>11. Změny těchto zásad</h2>
              <p>
                Tyto zásady můžeme čas od času aktualizovat. O podstatných změnách vás
                budeme informovat e-mailem nebo prostřednictvím oznámení v aplikaci
                minimálně 30 dní předem.
              </p>
              <p>
                Datum poslední aktualizace najdete v záhlaví tohoto dokumentu.
              </p>

              <h2>12. Kontakt</h2>
              <p>
                Pokud máte jakékoli dotazy ohledně zpracování osobních údajů, kontaktujte nás:
              </p>
              <ul>
                <li>
                  <strong>E-mail:</strong> <a href="mailto:privacy@teamforge.cz">privacy@teamforge.cz</a>
                </li>
                <li>
                  <strong>Pověřenec pro ochranu osobních údajů:</strong> <a href="mailto:dpo@vertigosaas.cz">dpo@vertigosaas.cz</a>
                </li>
                <li>
                  <strong>Poštovní adresa:</strong> VertiGo SaaS, [Adresa], [PSČ] [Město]
                </li>
              </ul>

              <h2>13. Právo podat stížnost</h2>
              <p>
                Máte právo podat stížnost u dozorového orgánu, pokud se domníváte, že
                zpracování vašich osobních údajů porušuje GDPR:
              </p>
              <p>
                <strong>Úřad pro ochranu osobních údajů</strong><br />
                Pplk. Sochora 27<br />
                170 00 Praha 7<br />
                Tel: +420 234 665 111<br />
                Web: <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer">www.uoou.cz</a>
              </p>
            </article>
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
