import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Ilustrace */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-neutral-gray-800 rounded-full flex items-center justify-center border border-neutral-gray-600">
            <span className="text-6xl">🎭</span>
          </div>
        </div>
        <h1 className="text-7xl md:text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-4">
          Stránka nenalezena
        </h2>
        <p className="text-neutral-gray-200 mb-8 text-lg">
          Omlouváme se, ale hledaná stránka neexistuje nebo byla přesunuta.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Zpět na hlavní stránku
          </Link>
          <Link
            href="/kontakt"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-white/50 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Kontaktujte nás
          </Link>
        </div>
      </div>
    </div>
  )
}
