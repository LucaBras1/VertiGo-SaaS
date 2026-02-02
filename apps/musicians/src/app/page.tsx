import Link from 'next/link'
import { Music, Sparkles, DollarSign, FileText, Calendar, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">GigBook</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-primary-600 transition">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-primary-600 transition">
              Pricing
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-primary-600 transition">
              FAQ
            </Link>
            <Link
              href="/auth/signin"
              className="text-gray-600 hover:text-primary-600 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Booking Management</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Stop Managing Spreadsheets.
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              Start Making Music.
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            GigBook streamlines your music career with AI-powered setlist generation,
            smart pricing, and professional stage riders. Focus on your performance,
            we&apos;ll handle the business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link
              href="#demo"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-gray-200"
            >
              Watch Demo
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Music Business
            </h2>
            <p className="text-xl text-gray-600">
              From booking to performance, GigBook has you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: SetlistAI */}
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="SetlistAI"
              description="Generate perfect setlists in seconds. Our AI considers event type, mood, and audience to create engaging performances."
              color="primary"
            />

            {/* Feature 2: Smart Pricing */}
            <FeatureCard
              icon={<DollarSign className="w-6 h-6" />}
              title="Smart Pricing"
              description="Get competitive pricing suggestions based on event type, location, and market rates. Never undersell yourself again."
              color="secondary"
            />

            {/* Feature 3: Stage Riders */}
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Professional Tech Riders"
              description="Generate industry-standard stage riders with input lists, backline needs, and technical specifications."
              color="primary"
            />

            {/* Feature 4: Gig Management */}
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Gig Management"
              description="Track inquiries, quotes, and confirmed gigs. Never miss a booking or double-book again."
              color="secondary"
            />

            {/* Feature 5: Client CRM */}
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Client CRM"
              description="Manage relationships with venues and clients. Track history, preferences, and communication."
              color="primary"
            />

            {/* Feature 6: Invoicing */}
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Invoicing"
              description="Create and send professional invoices. Track payments and automate reminders."
              color="secondary"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-600 to-secondary-500 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Music Career?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of musicians already using GigBook to streamline their business
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Music className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">GigBook</span>
            </div>

            <div className="flex gap-8 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-primary-600 transition">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary-600 transition">
                Terms
              </Link>
              <Link href="/support" className="hover:text-primary-600 transition">
                Support
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              © 2026 GigBook. Built with ❤️ for musicians.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: 'primary' | 'secondary'
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
  }

  return (
    <div className="p-6 rounded-xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-lg transition">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  )
}
