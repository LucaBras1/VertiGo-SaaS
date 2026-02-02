import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-backstage-800 via-backstage-900 to-backstage-800 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <span className="text-2xl font-bold text-white">StageManager</span>
      </Link>

      {/* Auth card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-gray-400 text-sm text-center">
        &copy; {new Date().getFullYear()} StageManager. Part of VertiGo SaaS.
      </p>
    </div>
  )
}
