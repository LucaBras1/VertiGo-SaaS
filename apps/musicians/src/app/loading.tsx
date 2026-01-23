import { Music } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <Music className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
