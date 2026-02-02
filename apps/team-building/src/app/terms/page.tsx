import Link from 'next/link'
import { Users, FileText, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Obchodní podmínky | TeamForge',
  description: 'Všeobecné obchodní podmínky pro využívání platformy TeamForge',
}

export default function TermsPage() {
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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Obchodní podmínky
          </h1>
          <p className="text-xl text-gray-600">
            Poslední aktualizace: 23. ledna 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <article className="prose prose-lg max-w-none">
              <h2>1. Obecná ustanovení</h2>

              <h3>1.1 Vymezení pojmů</h3>
              <p>
                Tyto všeobecné obchodní podmínky (dále jen &quot;VOP&quot;) upravují vztahy mezi:
              </p>
              <ul>
                <li>
                  <strong>Poskytovatelem:</strong> VertiGo SaaS, IČO: XXXXXXXX, se sídlem
                  [Adresa], provozovatel platformy TeamForge (dále jen &quot;poskytovatel&quot;)
                </li>
                <li>
                  <strong>Zákazníkem:</strong> Fyzická nebo právnická osoba využívající
                  službu TeamForge (dále jen &quot;zákazník&quot;)
                </li>
              </ul>

              <h3>1.2 Předmět služby</h3>
              <p>
                TeamForge je cloudová softwarová platforma (SaaS) určená pro správu
                team building programů, aktivit, klientů a generování reportů s využitím
                umělé inteligence.
              </p>

              <h3>1.3 Akceptace podmínek</h3>
              <p>
                Registrací a používáním služby TeamForge vyjadřujete souhlas s těmito VOP.
                Pokud s podmínkami nesouhlasíte, službu nepoužívejte.
              </p>

              <h2>2. Registrace a vytvoření účtu</h2>

              <h3>2.1 Registrační proces</h3>
              <p>
                Pro využívání služby je nutné vytvořit uživatelský účet prostřednictvím
                registračního formuláře. Při registraci poskytujete:
              </p>
              <ul>
                <li>Jméno a příjmení kontaktní osoby</li>
                <li>E-mailovou adresu</li>
                <li>Telefonní číslo</li>
                <li>Název společnosti (pro firemní účty)</li>
                <li>Heslo (min. 8 znaků, kombinace písmen a čísel)</li>
              </ul>

              <h3>2.2 Pravdivost údajů</h3>
              <p>
                Zákazník se zavazuje poskytovat pravdivé, přesné a aktuální údaje. Zákazník
                je povinen neprodleně aktualizovat údaje v případě jejich změny.
              </p>

              <h3>2.3 Ochrana přístupu</h3>
              <p>
                Zákazník je odpovědný za ochranu svého hesla a přístupových údajů. O jakémkoliv
                neoprávněném použití účtu je zákazník povinen okamžitě informovat poskytovatele.
              </p>

              <h3>2.4 Jeden účet na společnost</h3>
              <p>
                Jeden účet je určen pro jednu společnost/team building poskytovatele. V rámci
                účtu lze vytvořit více uživatelů dle zvoleného tarifu.
              </p>

              <h2>3. Zkušební období a objednávka služby</h2>

              <h3>3.1 Zkušební období (Free Trial)</h3>
              <p>
                Poskytovatel nabízí 14denní zkušební období zdarma s plným přístupem ke všem
                funkcím. Zkušební období nevyžaduje zadání platebních údajů.
              </p>

              <h3>3.2 Přechod na placenou verzi</h3>
              <p>
                Po skončení zkušebního období můžete:
              </p>
              <ul>
                <li>
                  <strong>Aktivovat placenou službu:</strong> Zvolíte tarif a zadáte platební údaje
                </li>
                <li>
                  <strong>Neaktivovat službu:</strong> Účet přejde do režimu &quot;pouze čtení&quot; -
                  data budou dostupná k prohlížení a exportu po dobu 30 dnů
                </li>
              </ul>

              <h3>3.3 Výběr tarifu</h3>
              <p>
                Zákazník si vybírá z dostupných tarifů:
              </p>
              <ul>
                <li>
                  <strong>Starter:</strong> Pro malé team building společnosti (1 uživatel)
                </li>
                <li>
                  <strong>Professional:</strong> Pro střední společnosti (5 uživatelů)
                </li>
                <li>
                  <strong>Enterprise:</strong> Pro velké agentury (neomezený počet uživatelů)
                </li>
              </ul>
              <p>
                Aktuální ceny a rozsah funkcí jednotlivých tarifů jsou dostupné na
                <Link href="/#pricing" className="text-brand-primary hover:underline"> stránce s ceníkem</Link>.
              </p>

              <h2>4. Ceny a platební podmínky</h2>

              <h3>4.1 Ceny služby</h3>
              <p>
                Ceny jsou uvedeny bez DPH. K ceně bude připočítána DPH dle platné legislativy
                (v ČR aktuálně 21 %).
              </p>

              <h3>4.2 Fakturační období</h3>
              <p>
                Služba se účtuje:
              </p>
              <ul>
                <li>
                  <strong>Měsíčně:</strong> Platba se provádí vždy k 1. dni měsíce dopředu
                </li>
                <li>
                  <strong>Ročně:</strong> Platba se provádí jednorázově na celý rok dopředu
                  se slevou 20 %
                </li>
              </ul>

              <h3>4.3 Způsoby platby</h3>
              <p>
                Platbu lze provést:
              </p>
              <ul>
                <li>Platební kartou (Visa, MasterCard) - automatické opakované platby</li>
                <li>Bankovním převodem na základě faktury (pro roční platby)</li>
              </ul>

              <h3>4.4 Automatické obnovení</h3>
              <p>
                Služba se automaticky obnovuje na další období, pokud ji zákazník nezruší
                minimálně 7 dnů před koncem aktuálního období.
              </p>

              <h3>4.5 Změna cen</h3>
              <p>
                Poskytovatel si vyhrazuje právo změnit ceny služby. O změně bude zákazník
                informován minimálně 60 dnů předem e-mailem. Změna ceny se vztahuje na
                další fakturační období.
              </p>

              <h3>4.6 Nezaplacení</h3>
              <p>
                V případě nezaplacení faktury ve lhůtě splatnosti:
              </p>
              <ul>
                <li>Poskytovatel zašle upomínku na e-mail zákazníka</li>
                <li>Po 7 dnech může být účet pozastaven (režim &quot;pouze čtení&quot;)</li>
                <li>Po 30 dnech může být účet trvale zrušen a data smazána</li>
              </ul>

              <h2>5. Práva a povinnosti poskytovatele</h2>

              <h3>5.1 Poskytovatel se zavazuje</h3>
              <ul>
                <li>Zajistit dostupnost služby minimálně 99,5 % času měsíčně (kromě plánovaných údržeb)</li>
                <li>Provádět pravidelné zálohy dat (každých 24 hodin)</li>
                <li>Chránit osobní údaje zákazníků v souladu s GDPR</li>
                <li>Poskytovat technickou podporu prostřednictvím e-mailu a chat (v pracovní dny 9-17 h)</li>
                <li>Oznámit plánované odstávky minimálně 48 hodin předem</li>
              </ul>

              <h3>5.2 Poskytovatel má právo</h3>
              <ul>
                <li>Pozastavit účet v případě porušení VOP</li>
                <li>Provádět nutné údržby a aktualizace systému</li>
                <li>Omezit přístup k účtu při podezření na zneužití</li>
                <li>Ukončit poskytování služby s výpovědní dobou 90 dnů</li>
              </ul>

              <h2>6. Práva a povinnosti zákazníka</h2>

              <h3>6.1 Zákazník se zavazuje</h3>
              <ul>
                <li>Používat službu v souladu s těmito VOP a platnými zákony</li>
                <li>Nepoužívat službu k nezákonným účelům</li>
                <li>Nesdílet přístupové údaje s neoprávněnými osobami</li>
                <li>Hradit cenu služby řádně a včas</li>
                <li>Nenahrávat škodlivý obsah (viry, malware)</li>
                <li>Neporušovat autorská práva třetích stran</li>
              </ul>

              <h3>6.2 Zákazník má právo</h3>
              <ul>
                <li>Využívat všechny funkce služby dle zvoleného tarifu</li>
                <li>Kdykoliv exportovat svá data ve formátu JSON/CSV</li>
                <li>Kdykoliv změnit tarif (změna účinná od následujícího období)</li>
                <li>Požadovat technickou podporu</li>
                <li>Zrušit službu s okamžitou účinností (bez nároku na vrácení poměrné části ceny)</li>
              </ul>

              <h2>7. Ukončení služby a zrušení účtu</h2>

              <h3>7.1 Zrušení ze strany zákazníka</h3>
              <p>
                Zákazník může službu zrušit kdykoliv prostřednictvím sekce Nastavení → Účet
                nebo e-mailem na support@teamforge.cz. Zrušení je účinné okamžitě, ale přístup
                k placené službě trvá do konce aktuálního fakturačního období.
              </p>

              <h3>7.2 Zrušení ze strany poskytovatele</h3>
              <p>
                Poskytovatel může zrušit účet zákazníka okamžitě v případě:
              </p>
              <ul>
                <li>Závažného porušení VOP</li>
                <li>Zneužití služby (spam, phishing, nezákonná činnost)</li>
                <li>Opakovaného nezaplacení služby</li>
                <li>Porušení bezpečnosti systému</li>
              </ul>

              <h3>7.3 Export dat před zrušením</h3>
              <p>
                Před zrušením účtu doporučujeme exportovat všechna data. Po zrušení zůstávají
                data dostupná k exportu po dobu 30 dnů, poté jsou trvale smazána.
              </p>

              <h3>7.4 Vrácení peněz</h3>
              <p>
                V případě zrušení služby zákazníkem nemá zákazník nárok na vrácení poměrné
                části ceny za aktuální fakturační období, kromě případů uvedených v čl. 8
                (Odstoupení od smlouvy).
              </p>

              <h2>8. Odstoupení od smlouvy (spotřebitelé)</h2>

              <h3>8.1 Odstoupení do 14 dnů</h3>
              <p>
                Pokud jste spotřebitel (fyzická osoba, která nejedná v rámci podnikatelské
                činnosti), máte právo odstoupit od smlouvy do 14 dnů od aktivace placené služby
                bez udání důvodu.
              </p>

              <h3>8.2 Postup odstoupení</h3>
              <p>
                Pro odstoupení zašlete e-mail na support@teamforge.cz s uvedením čísla objednávky
                a požadavkem na odstoupení. Do 14 dnů vám vrátíme zaplacenou částku stejným
                způsobem platby.
              </p>

              <h3>8.3 Ztráta práva na odstoupení</h3>
              <p>
                Pokud jste během 14denní lhůty aktivně využívali službu (vytvořili programy,
                aktivity, reporty), můžete stále odstoupit, ale bude vám účtován poměrný podíl
                ceny za skutečně využitou dobu.
              </p>

              <h2>9. Reklamace a odpovědnost</h2>

              <h3>9.1 Reklamační řád</h3>
              <p>
                Zákazník má právo reklamovat vady služby e-mailem na support@teamforge.cz.
                Poskytovatel se zavazuje odpovědět do 48 hodin a vyřešit reklamaci do 30 dnů.
              </p>

              <h3>9.2 Omezení odpovědnosti</h3>
              <p>
                Poskytovatel neodpovídá za:
              </p>
              <ul>
                <li>Ztrátu dat způsobenou zákazníkem (omylem smazaný obsah)</li>
                <li>Nedostupnost služby způsobenou třetí stranou (výpadek internetu, AWS)</li>
                <li>Nepřesnosti v AI generovaných výstupech (reporty, doporučení)</li>
                <li>Škody vzniklé nesprávným použitím služby</li>
              </ul>

              <h3>9.3 Maximální výše náhrady škody</h3>
              <p>
                Celková odpovědnost poskytovatele je omezena na výši zaplacené ceny služby
                za poslední 3 měsíce.
              </p>

              <h2>10. Duševní vlastnictví</h2>

              <h3>10.1 Vlastnictví platformy</h3>
              <p>
                TeamForge, včetně veškerého kódu, designu, AI modelů, databázové struktury
                a obchodního tajemství, je výhradním vlastnictvím poskytovatele. Zákazník
                získává pouze licenci k užívání služby.
              </p>

              <h3>10.2 Vlastnictví dat zákazníka</h3>
              <p>
                Veškerá data vytvořená zákazníkem (programy, aktivity, klienti, poznámky)
                jsou výhradním vlastnictvím zákazníka. Poskytovatel získává pouze oprávnění
                tato data zpracovávat za účelem poskytování služby.
              </p>

              <h3>10.3 Použití dat pro AI trénování</h3>
              <p>
                Poskytovatel může používat anonymizovaná a agregovaná data pro zlepšování
                AI modelů. Osobní údaje a identifikovatelné informace nebudou použity bez
                explicitního souhlasu.
              </p>

              <h2>11. Ochrana osobních údajů</h2>
              <p>
                Zpracování osobních údajů se řídí samostatným dokumentem
                <Link href="/privacy" className="text-brand-primary hover:underline"> Zásady ochrany osobních údajů</Link>,
                který je nedílnou součástí těchto VOP.
              </p>

              <h2>12. Závěrečná ustanovení</h2>

              <h3>12.1 Změna VOP</h3>
              <p>
                Poskytovatel si vyhrazuje právo změnit tyto VOP. O změně budou zákazníci
                informováni e-mailem minimálně 30 dnů předem. Pokračováním v používání
                služby po datu účinnosti změn vyjadřujete souhlas s novými VOP.
              </p>

              <h3>12.2 Řešení sporů</h3>
              <p>
                V případě sporu se strany pokusí najít řešení dohodou. Pokud dohoda není
                možná, spory budou řešeny u příslušného soudu v České republice.
              </p>

              <h3>12.3 Spotřebitelské spory (ADR)</h3>
              <p>
                Spotřebitel má právo obrátit se na subjekt mimosoudního řešení spotřebitelských
                sporů, kterým je:
              </p>
              <p>
                <strong>Česká obchodní inspekce</strong><br />
                Štěpánská 15<br />
                120 00 Praha 2<br />
                Web: <a href="https://www.coi.cz" target="_blank" rel="noopener noreferrer">www.coi.cz</a>
              </p>

              <h3>12.4 Kontakt</h3>
              <p>
                Pro jakékoliv dotazy ohledně těchto VOP nás kontaktujte:
              </p>
              <ul>
                <li>
                  <strong>E-mail:</strong> <a href="mailto:support@teamforge.cz">support@teamforge.cz</a>
                </li>
                <li>
                  <strong>Telefon:</strong> +420 XXX XXX XXX (Po-Pá 9-17 h)
                </li>
              </ul>

              <h3>12.5 Účinnost</h3>
              <p>
                Tyto VOP nabývají účinnosti dnem 1. ledna 2025.
              </p>
            </article>
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
