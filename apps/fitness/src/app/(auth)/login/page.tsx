import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Přihlášení | FitAdmin',
  description: 'Přihlaste se do FitAdmin',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-gray-100 rounded-lg" />}>
      <LoginForm />
    </Suspense>
  )
}
