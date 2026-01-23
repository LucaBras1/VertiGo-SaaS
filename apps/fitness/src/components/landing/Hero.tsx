import Link from 'next/link'
import { Dumbbell, Sparkles, Calendar, Users } from 'lucide-react'

export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-800 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="text-white">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
              <span className="text-sm font-medium">AI-Powered Fitness Management</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Smart Management for{' '}
              <span className="text-yellow-300">Fitness Pros</span>
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              The all-in-one platform for personal trainers and studios. Manage clients,
              generate AI-powered workouts, track progress, and grow your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Start Free Trial
                <Sparkles className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all border-2 border-white/20"
              >
                Watch Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20">
              <div>
                <div className="text-3xl font-bold text-yellow-300">10K+</div>
                <div className="text-sm text-white/80">Active Trainers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300">500K+</div>
                <div className="text-sm text-white/80">Workouts Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300">98%</div>
                <div className="text-sm text-white/80">Client Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform lg:rotate-2">
              <div className="absolute -top-4 -right-4 bg-yellow-300 rounded-full p-4 shadow-lg">
                <Dumbbell className="w-8 h-8 text-secondary-800" />
              </div>

              {/* Mock dashboard preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
                      <p className="text-sm text-gray-500">8 sessions, 2 classes</p>
                    </div>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-200 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">John Smith</p>
                      <p className="text-sm text-gray-600">Strength Training • 9:00 AM</p>
                    </div>
                    <div className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded">
                      AI PLAN
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Sarah Johnson</p>
                      <p className="text-sm text-gray-600">HIIT Class • 10:00 AM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Mike Davis</p>
                      <p className="text-sm text-gray-600">Weight Loss • 11:00 AM</p>
                    </div>
                    <div className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded">
                      AI PLAN
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Weekly Progress</span>
                    <span className="font-semibold text-primary-600">+12% ↑</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -bottom-4 -left-4 bg-secondary-800 text-white rounded-xl p-4 shadow-xl">
              <div className="text-2xl font-bold">AI</div>
              <div className="text-xs">Powered</div>
            </div>

            <div className="absolute -top-4 -left-4 bg-yellow-300 text-secondary-800 rounded-xl p-3 shadow-xl">
              <div className="text-lg font-bold">⚡</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
