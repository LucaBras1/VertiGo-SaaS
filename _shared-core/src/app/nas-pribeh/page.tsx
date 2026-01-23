import { Metadata } from 'next'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import PortableText from '@/components/ui/PortableText'
import { prisma } from '@/lib/prisma'
import type { PortableTextBlock } from '@portabletext/types'

export const metadata: Metadata = {
  title: 'Náš příběh',
  description: 'Historie Divadla Studna od roku 1993 až po současnost. Přečtěte si náš příběh plný divadelních dobrodružství.',
}

interface PageSection {
  _key: string
  heading: string
  icon?: string
  content: PortableTextBlock[]
}

interface PageContent {
  heading?: string
  subheading?: string
  sections?: PageSection[]
}

export default async function NasPribehPage() {
  // Načíst data stránky z Prisma
  let pageData: PageContent | null = null
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'nas-pribeh' },
      select: { content: true },
    })
    if (page?.content) {
      pageData = page.content as PageContent
    }
  } catch (error) {
    console.warn('Failed to fetch page data from Prisma', error)
  }

  // Fallback texty
  const heading = pageData?.heading || 'Náš příběh'
  const subheading = pageData?.subheading || 'Více než 30 let divadelních dobrodružství, radosti a nezapomenutelných zážitků.'

  // Timeline milestones (fallback pokud nejsou v Prisma)
  const defaultMilestones = [
    {
      year: '1993',
      title: 'Založení divadla',
      description: 'Divadlo Studna vzniklo v malé vesnici Hosín u Českých Budějovic. Od začátku jsme se zaměřovali na tradiční loutkové divadlo s důrazem na kvalitu a originalitu.',
      icon: '🎭'
    },
    {
      year: '1995-2000',
      title: 'První úspěchy',
      description: 'Naše první představení sklízela úspěch po celém jižní Čechách. Začali jsme experimentovat s novými formami - stínovým divadlem a chůdovými postavami.',
      icon: '🌟'
    },
    {
      year: '2000-2010',
      title: 'Expanze a růst',
      description: 'Rozšířili jsme působnost po celé České republice. V repertoáru máme již více než 10 představení pro různé věkové kategorie. Začínáme pořádat divadelní dílny a kurzy.',
      icon: '📈'
    },
    {
      year: '2010-2020',
      title: 'Etablování',
      description: 'Divadlo Studna se stalo respektovaným jménem v české divadelní scéně. Pravidelně účinkujeme na festivalech, přidáváme hudební produkce a rozšiřujeme technické možnosti.',
      icon: '🎪'
    },
    {
      year: '2020-dnes',
      title: 'Moderna a inovace',
      description: 'Přežili jsme pandemii a vrátili se ještě silnější. Modernizujeme naše představení, experimentujeme s novými technologiemi a stále hledáme nové způsoby, jak bavit a inspirovat naše diváky.',
      icon: '🚀'
    }
  ]

  const sections = pageData?.sections || []
  const milestones = sections.length > 0 ? sections : defaultMilestones

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {heading}
          </h1>
          <p className="text-lg text-neutral-gray-200 max-w-3xl mx-auto">
            {subheading}
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {milestones.map((milestone, index) => {
            // Pokud jsou data z Prisma (mají _key a content)
            if ('_key' in milestone && 'content' in milestone) {
              return (
                <div key={milestone._key} className="flex gap-6">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl border-2 border-primary">
                      {milestone.icon || '📖'}
                    </div>
                  </div>

                  {/* Content */}
                  <Card className="flex-1" hover>
                    <h3 className="text-2xl font-serif font-bold text-white mb-4">
                      {milestone.heading}
                    </h3>
                    <div className="prose prose-lg max-w-none text-neutral-gray-200">
                      <PortableText value={milestone.content} />
                    </div>
                  </Card>
                </div>
              )
            }

            // Fallback pro výchozí data
            const defaultMilestone = milestone as typeof defaultMilestones[0]
            return (
              <div key={index} className="flex gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl border-2 border-primary">
                    {defaultMilestone.icon}
                  </div>
                </div>

                {/* Content */}
                <Card className="flex-1" hover>
                  <div className="text-primary font-bold mb-2">{defaultMilestone.year}</div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-4">
                    {defaultMilestone.title}
                  </h3>
                  <p className="text-neutral-gray-200 leading-relaxed">
                    {defaultMilestone.description}
                  </p>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Closing Section */}
        <Card className="mt-16 bg-gradient-to-br from-primary/10 to-secondary/10 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Příběh pokračuje...
          </h2>
          <p className="text-lg text-neutral-gray-200 max-w-2xl mx-auto mb-6">
            Jsme hrdí na to, co jsme za více než 30 let dokázali. Ale ještě hrdější jsme na to,
            co nás čeká. Těšíme se na další představení, nové příběhy a radost v očích našich diváků.
          </p>
          <p className="text-primary font-semibold text-xl">
            Divadlo Studna - Od roku 1993 s láskou k divadlu
          </p>
        </Card>
      </Container>
    </div>
  )
}
