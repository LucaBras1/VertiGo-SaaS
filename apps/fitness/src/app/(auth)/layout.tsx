import { Dumbbell } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex justify-center items-center gap-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Dumbbell className="h-7 w-7 text-primary-600" />
            </div>
          </Link>
          <h2 className="mt-4 text-center text-3xl font-bold text-white">
            FitAdmin
          </h2>
          <p className="mt-2 text-center text-sm text-primary-100">
            AI-powered management for fitness professionals
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10">
            {children}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-primary-200">
          <Link href="/" className="font-medium text-white hover:text-primary-100">
            &larr; Zpět na hlavní stránku
          </Link>
        </p>
      </div>
    </div>
  )
}
