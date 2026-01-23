import { Metadata } from 'next'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Soubor',
  description: 'Seznamte se s lidmi za Divadlem Studna. Náš tým tvoří zkušení umělci a profesionálové.',
}

export default async function SouborPage() {
  const teamMembers = await prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })

  // Fallback texty
  const heading = 'Náš soubor'
  const subheading = 'Jsme rodina divadelníků s láskou k umění a zkušenostmi z více než 30 let působení na divadelní scéně.'

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {heading}
          </h1>
          <p className="text-lg text-neutral-gray-200 max-w-3xl">
            {subheading}
          </p>
        </div>

        {/* Team Grid */}
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => {
              const bio = member.bio as { text?: string } | string | null
              const bioText = typeof bio === 'string' ? bio : bio?.text

              return (
                <Card key={member.id} hover className="text-center">
                  {/* Photo */}
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-light/20 to-secondary/20 flex items-center justify-center text-5xl overflow-hidden">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.photoAlt || `${member.firstName} ${member.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      '🎭'
                    )}
                  </div>

                  {/* Name & Role */}
                  <h3 className="text-xl font-bold text-white mb-1">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-primary font-semibold mb-4">{member.role}</p>

                  {/* Bio */}
                  {bioText && (
                    <p className="text-neutral-gray-200 text-sm mb-4">{bioText}</p>
                  )}

                  {/* Contact */}
                  <div className="space-y-2 text-sm">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center justify-center gap-2 text-neutral-gray-200 hover:text-primary transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs">{member.email}</span>
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone.replace(/\s/g, '')}`}
                        className="flex items-center justify-center gap-2 text-neutral-gray-200 hover:text-primary transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-xs">{member.phone}</span>
                      </a>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-neutral-gray-200">
              Informace o souboru budou brzy doplněny.
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}
