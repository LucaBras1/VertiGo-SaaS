'use client'

import Link from 'next/link'
import {
  Calendar,
  Users,
  Zap,
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  BarChart3
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">
                EventPro
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">
                Pricing
              </a>
              <Link href="/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                Login
              </Link>
              <Link href="/signup" className="btn-primary">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Event Management
              </div>

              <h1 className="text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
                Plan <span className="gradient-text">Flawless Events</span> with AI
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                From corporate galas to music festivals, EventPro streamlines your entire workflow.
                AI-powered timeline optimization, performer management, and seamless coordination—all in one platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/signup" className="btn-primary inline-flex items-center justify-center">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <button className="btn-secondary inline-flex items-center justify-center">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8">
                <div>
                  <div className="flex items-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">4.9/5</span> from 200+ reviews
                  </p>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div>
                  <p className="text-3xl font-display font-bold gradient-text">5,000+</p>
                  <p className="text-sm text-gray-600">Events Managed</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Timeline Generated</p>
                      <p className="text-sm text-gray-600">AI optimized for 150 guests</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">8 Performers Booked</p>
                      <p className="text-sm text-gray-600">All schedules coordinated</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-accent-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Setup Times Optimized</p>
                      <p className="text-sm text-gray-600">Reduced by 40%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              Everything You Need to <span className="gradient-text">Run Events</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional tools designed for event planners, venues, and entertainment professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Timeline Optimizer"
              description="Generate perfect event schedules considering performer dependencies, setup times, and guest experience flow."
              gradient="from-purple-500 to-purple-600"
            />

            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Performer Management"
              description="Manage your roster, track availability, coordinate call times, and handle bookings all in one place."
              gradient="from-accent-500 to-accent-600"
            />

            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Smart Scheduling"
              description="Avoid conflicts, optimize transitions, and create backup plans automatically."
              gradient="from-primary-500 to-primary-600"
            />

            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Real-Time Updates"
              description="Keep everyone in sync with instant notifications for schedule changes and updates."
              gradient="from-blue-500 to-blue-600"
            />

            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Analytics & Reports"
              description="Track performance, revenue, and client satisfaction across all your events."
              gradient="from-green-500 to-green-600"
            />

            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Contract Management"
              description="Generate, send, and track contracts with digital signatures built in."
              gradient="from-indigo-500 to-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              From Planning to <span className="gradient-text">Perfection</span>
            </h2>
            <p className="text-xl text-gray-600">Simple workflow, powerful results</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Step
              number="1"
              title="Create Event"
              description="Enter event details, venue, and guest count"
            />
            <Step
              number="2"
              title="Add Performers"
              description="Select from your roster or add new talent"
            />
            <Step
              number="3"
              title="Generate Timeline"
              description="AI creates optimized schedule in seconds"
            />
            <Step
              number="4"
              title="Execute Flawlessly"
              description="Real-time coordination on event day"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-white">
            <h2 className="text-4xl font-display font-bold mb-4">
              Trusted by Event Professionals Worldwide
            </h2>
            <p className="text-xl text-primary-100 mb-12">
              Join thousands of planners creating unforgettable experiences
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <StatCard number="5,000+" label="Events Managed" />
              <StatCard number="98%" label="Client Satisfaction" />
              <StatCard number="40%" label="Time Saved" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Elevate Your Events?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your free 14-day trial. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary inline-flex items-center justify-center">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="btn-secondary inline-flex items-center justify-center">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-bold text-white">
                  EventPro
                </span>
              </div>
              <p className="text-sm">
                Professional event management powered by AI
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 EventPro. Part of VertiGo SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  gradient
}: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="card group hover:scale-105 cursor-pointer">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function Step({
  number,
  title,
  description
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
      <div className="text-5xl font-display font-bold mb-2">{number}</div>
      <div className="text-primary-100">{label}</div>
    </div>
  )
}
