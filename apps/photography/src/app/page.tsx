import Link from 'next/link'
import { Camera, Aperture, Image, Zap, Clock, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-charcoal-50">
      {/* Header */}
      <header className="border-b border-charcoal-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Aperture className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-bold text-charcoal-900">ShootFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-charcoal-600 hover:text-amber-500">
              Features
            </Link>
            <Link href="#pricing" className="text-charcoal-600 hover:text-amber-500">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-charcoal-600 hover:text-amber-500">
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-charcoal-900 mb-6">
            AI Assistant for
            <span className="text-amber-500"> Photographers</span>
          </h1>
          <p className="text-xl text-charcoal-600 mb-8 leading-relaxed">
            From booking to delivery, ShootFlow streamlines your photography business
            with AI-powered shot lists, photo curation, and workflow automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-amber-500 text-white text-lg font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-white text-charcoal-700 text-lg font-semibold rounded-lg hover:bg-charcoal-50 transition-colors border-2 border-charcoal-200"
            >
              See How It Works
            </Link>
          </div>
          <p className="mt-4 text-sm text-charcoal-500">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal-900 mb-4">
            AI-Powered Features
          </h2>
          <p className="text-xl text-charcoal-600">
            Let AI handle the busywork so you can focus on creativity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1: Shot List AI */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-charcoal-100">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-charcoal-900 mb-3">
              ShotListAI
            </h3>
            <p className="text-charcoal-600 mb-4">
              Generate comprehensive shot lists tailored to your event type, timeline,
              and venue. Never miss a must-have shot again.
            </p>
            <ul className="text-sm text-charcoal-600 space-y-2">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Organized by timeline and category
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Priority levels and technical notes
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Export to PDF for field use
              </li>
            </ul>
          </div>

          {/* Feature 2: Gallery Curator AI */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-charcoal-100">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Image className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-charcoal-900 mb-3">
              GalleryCuratorAI
            </h3>
            <p className="text-charcoal-600 mb-4">
              AI analyzes your photos and selects the best shots based on technical
              quality, emotion, and variety. Save hours on culling.
            </p>
            <ul className="text-sm text-charcoal-600 space-y-2">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                GPT-4 Vision analysis
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Quality scoring and categorization
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Duplicate detection
              </li>
            </ul>
          </div>

          {/* Feature 3: Edit Time Predictor */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-charcoal-100">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-charcoal-900 mb-3">
              EditTimePredictorAI
            </h3>
            <p className="text-charcoal-600 mb-4">
              Get realistic editing time estimates and delivery dates. Set accurate
              client expectations from day one.
            </p>
            <ul className="text-sm text-charcoal-600 space-y-2">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Time breakdown by workflow stage
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Personalized based on your speed
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Industry benchmark comparison
              </li>
            </ul>
          </div>

          {/* Feature 4: Style Matcher */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-charcoal-100">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-charcoal-900 mb-3">
              StyleMatcherAI
            </h3>
            <p className="text-charcoal-600 mb-4">
              AI analyzes your portfolio and describes your unique style. Get marketing
              copy that attracts your ideal clients.
            </p>
            <ul className="text-sm text-charcoal-600 space-y-2">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Style description and keywords
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Marketing copy generation
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Ideal client matching
              </li>
            </ul>
          </div>

          {/* Feature 5: Workflow Management */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-charcoal-100">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-charcoal-900 mb-3">
              Complete Workflow
            </h3>
            <p className="text-charcoal-600 mb-4">
              Manage your entire photography business from inquiry to delivery in one
              place. No more scattered tools.
            </p>
            <ul className="text-sm text-charcoal-600 space-y-2">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Package and booking management
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Client galleries with sharing
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Invoicing and payments
              </li>
            </ul>
          </div>

          {/* Feature 6: Client Communication */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-charcoal-100">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-charcoal-900 mb-3">
              Smart Communication
            </h3>
            <p className="text-charcoal-600 mb-4">
              AI-generated email templates for every stage of your workflow. Professional
              communication in seconds.
            </p>
            <ul className="text-sm text-charcoal-600 space-y-2">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Booking confirmations
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Gallery delivery notifications
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Review requests
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-charcoal-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-charcoal-600">
            Choose the plan that fits your photography business
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-xl border border-charcoal-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-charcoal-900 mb-2">Free</h3>
            <p className="text-4xl font-bold text-charcoal-900 mb-4">
              $0<span className="text-lg font-normal text-charcoal-500">/mo</span>
            </p>
            <p className="text-charcoal-600 mb-6">Perfect for getting started</p>
            <ul className="space-y-3 mb-8 text-charcoal-600">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                5 packages per month
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Basic AI features
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                1GB storage
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Email support
              </li>
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full py-3 text-center border-2 border-charcoal-300 text-charcoal-700 rounded-lg font-semibold hover:bg-charcoal-50 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-8 rounded-xl shadow-lg relative transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-charcoal-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <p className="text-4xl font-bold text-white mb-4">
              $29<span className="text-lg font-normal text-amber-100">/mo</span>
            </p>
            <p className="text-amber-100 mb-6">For growing photography businesses</p>
            <ul className="space-y-3 mb-8 text-white">
              <li className="flex items-start">
                <span className="text-amber-200 mr-2">✓</span>
                Unlimited packages
              </li>
              <li className="flex items-start">
                <span className="text-amber-200 mr-2">✓</span>
                Full AI suite
              </li>
              <li className="flex items-start">
                <span className="text-amber-200 mr-2">✓</span>
                50GB storage
              </li>
              <li className="flex items-start">
                <span className="text-amber-200 mr-2">✓</span>
                Priority support
              </li>
              <li className="flex items-start">
                <span className="text-amber-200 mr-2">✓</span>
                Custom branding
              </li>
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full py-3 text-center bg-white text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white p-8 rounded-xl border border-charcoal-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-charcoal-900 mb-2">Enterprise</h3>
            <p className="text-4xl font-bold text-charcoal-900 mb-4">
              $99<span className="text-lg font-normal text-charcoal-500">/mo</span>
            </p>
            <p className="text-charcoal-600 mb-6">For studios and teams</p>
            <ul className="space-y-3 mb-8 text-charcoal-600">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Everything in Pro
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Team members (up to 5)
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Unlimited storage
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Custom integrations
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                Dedicated support
              </li>
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full py-3 text-center border-2 border-charcoal-300 text-charcoal-700 rounded-lg font-semibold hover:bg-charcoal-50 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-12 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Ready to transform your photography workflow?
          </h2>
          <p className="text-xl mb-8 text-amber-50">
            Join hundreds of photographers who save hours every week with ShootFlow.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-amber-600 text-lg font-semibold rounded-lg hover:bg-amber-50 transition-colors shadow-lg"
          >
            Start Your Free Trial
          </Link>
          <p className="mt-4 text-sm text-amber-100">
            14 days free • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-charcoal-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Aperture className="w-6 h-6 text-amber-500" />
              <span className="text-lg font-bold text-charcoal-900">ShootFlow</span>
            </div>
            <div className="text-sm text-charcoal-600">
              © 2024 ShootFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
