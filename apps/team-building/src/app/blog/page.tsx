/**
 * Blog Page - Placeholder
 */

import Link from 'next/link'
import { ArrowLeft, BookOpen, Clock, User } from 'lucide-react'

export const metadata = {
  title: 'Blog | TeamForge',
  description: 'Novinky a články o team buildingu a firemní kultuře',
}

// Placeholder blog posts
const posts = [
  {
    id: 1,
    title: '5 klíčových trendů v team buildingu pro rok 2025',
    excerpt: 'Objevte nejnovější trendy, které formují firemní team building aktivity a jak je můžete využít pro váš tým.',
    author: 'TeamForge Team',
    date: '15. ledna 2025',
    readTime: '5 min',
    category: 'Trendy',
  },
  {
    id: 2,
    title: 'Jak AI transformuje team building',
    excerpt: 'Umělá inteligence přináší revoluci do plánování a realizace team buildingových aktivit. Přečtěte si, jak.',
    author: 'TeamForge Team',
    date: '10. ledna 2025',
    readTime: '7 min',
    category: 'Technologie',
  },
  {
    id: 3,
    title: 'Měření úspěšnosti team buildingu: Co sledovat?',
    excerpt: 'KPI a metriky, které vám pomohou vyhodnotit efektivitu vašich team buildingových aktivit.',
    author: 'TeamForge Team',
    date: '5. ledna 2025',
    readTime: '6 min',
    category: 'Best Practices',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Zpět na hlavní stránku
          </Link>
          <Link href="/" className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            TeamForge
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Blog</h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Novinky, tipy a best practices ze světa team buildingu a firemní kultury.
          </p>
        </div>
      </section>

      {/* Coming Soon Banner */}
      <section className="px-4 mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Blog se připravuje</h2>
            <p className="text-blue-100">
              Pracujeme na obsahu, který vám pomůže vytvářet lepší týmy. Zanechte nám email a dáme vám vědět.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Preview */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">Připravované články</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white dark:bg-neutral-950 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-neutral-300 dark:text-neutral-600" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-3 mb-2">{post.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-neutral-400 dark:text-neutral-500">&copy; 2025 TeamForge. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </div>
  )
}
