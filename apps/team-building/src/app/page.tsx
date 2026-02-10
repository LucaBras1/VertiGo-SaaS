import Link from 'next/link'
import {
  Users,
  Target,
  Sparkles,
  FileText,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap,
  Check,
  Crown
} from 'lucide-react'
import { Navigation } from '@/components/landing/Navigation'

const pricingPlans = [
  {
    name: 'Starter',
    price: '49',
    description: 'Perfect for small team building companies',
    icon: Zap,
    features: [
      '10 sessions per month',
      'Basic AI activity matching',
      'Email session debriefs',
      'Customer management',
      'Standard reports',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '149',
    description: 'For growing team building businesses',
    icon: Crown,
    features: [
      'Unlimited sessions',
      'All 4 AI modules',
      'Advanced analytics & insights',
      'Custom branding on reports',
      'Priority support',
      'API access',
      'Team collaboration',
      'PDF export',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '399',
    description: 'For large-scale operations',
    icon: Crown,
    features: [
      'Everything in Professional',
      'White-label solution',
      'Full API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Advanced security',
      'Multi-location support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-brand-600 dark:text-brand-400 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Powered by Advanced AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 bg-clip-text text-transparent">
            Build Stronger Teams
            <br />
            with AI
          </h1>

          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-3xl mx-auto">
            The intelligent team building platform that matches activities to objectives,
            calibrates difficulty, and generates HR-ready reports automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2 text-lg">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/demo" className="btn-outline inline-flex items-center gap-2 text-lg">
              Watch Demo
            </Link>
          </div>

          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">30k+</div>
              <div className="text-neutral-600 dark:text-neutral-400">Team Building Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">$4B+</div>
              <div className="text-neutral-600 dark:text-neutral-400">Market Size</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">95%</div>
              <div className="text-neutral-600 dark:text-neutral-400">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">10x</div>
              <div className="text-neutral-600 dark:text-neutral-400">Faster Reports</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section id="ai-powered" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              AI-Powered Intelligence
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Four specialized AI modules that transform how you design and deliver team building experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* TeamDynamicsAI */}
            <div className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">TeamDynamicsAI</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Analyze team composition, size, and dynamics to suggest the most appropriate activities.
                    Gets smarter with every session.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Analyzes team size, industry, and composition
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Suggests optimal activity sequences
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Predicts engagement and success rates
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ObjectiveMatcherAI */}
            <div className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-brand-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">ObjectiveMatcherAI</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Match corporate objectives (communication, trust, leadership) to activities with
                    precision scoring and evidence-based recommendations.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Maps objectives to learning outcomes
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Provides alignment scores (0-100)
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Suggests measurement metrics
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* DifficultyCalibratorAI */}
            <div className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">DifficultyCalibratorAI</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Automatically adjust activity difficulty based on team&apos;s physical capabilities,
                    age range, and experience level.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Adaptive difficulty scaling
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Real-time facilitator guidance
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Accessibility accommodations
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* DebriefGeneratorAI */}
            <div className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">DebriefGeneratorAI</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Generate professional, HR-ready post-session reports with team dynamics analysis,
                    recommendations, and next steps.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Executive summaries
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Objective achievement tracking
                    </li>
                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Actionable recommendations
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-24 px-4 bg-white/50 dark:bg-neutral-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Built specifically for corporate team building companies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Objective-Based Matching</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Match corporate goals (communication, trust, leadership) to the perfect activities
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Team Analytics</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Track team dynamics, engagement patterns, and development over time
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Corporate Invoicing</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Professional invoicing, payment tracking, and financial reporting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent{' '}
              <span className="text-brand-600 dark:text-brand-400">Pricing</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Choose the plan that fits your business. All plans include 14-day free trial.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 ${
                    plan.popular
                      ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-2xl scale-105'
                      : 'bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 shadow-lg'
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-neutral-900 dark:text-neutral-100 text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-xl mb-4 ${
                      plan.popular
                        ? 'bg-white/20'
                        : 'bg-blue-100'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        plan.popular ? 'text-white' : 'text-brand-600 dark:text-brand-400'
                      }`}
                    />
                  </div>

                  {/* Plan name */}
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      plan.popular ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p
                    className={`mb-6 ${
                      plan.popular ? 'text-white/90' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <span
                      className={`text-5xl font-bold ${
                        plan.popular ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className={`${
                        plan.popular ? 'text-white/80' : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      /month
                    </span>
                  </div>

                  {/* CTA button */}
                  <Link
                    href={plan.cta === 'Contact Sales' ? '/contact' : '/signup'}
                    className={`block w-full py-3 px-6 rounded-lg font-semibold mb-8 text-center transition-all ${
                      plan.popular
                        ? 'bg-white text-blue-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        : 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:from-blue-700 hover:to-emerald-700'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            plan.popular ? 'text-yellow-300' : 'text-brand-secondary'
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            plan.popular ? 'text-white/90' : 'text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Bottom note */}
          <div className="mt-12 text-center text-neutral-600 dark:text-neutral-400">
            <p className="mb-2">All plans include 14-day free trial. No credit card required.</p>
            <p>Need a custom plan? <Link href="/contact" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Contact us</Link></p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white/50 dark:bg-neutral-950/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Team Building Business?
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
            Join thousands of team building professionals using AI to deliver better experiences
          </p>
          <Link href="/signup" className="btn-primary inline-flex items-center gap-2 text-lg">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
            14-day trial • No credit card • Full access to all AI features
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                <span className="text-xl font-bold">TeamForge</span>
              </div>
              <p className="text-neutral-400 dark:text-neutral-500 text-sm">
                AI-powered team building management for corporate providers
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-400 dark:text-neutral-500">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#ai-powered" className="hover:text-white">AI Capabilities</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/demo" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-400 dark:text-neutral-500">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="/careers" className="hover:text-white">Careers</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-400 dark:text-neutral-500">
                <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms</a></li>
                <li><a href="/security" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            © 2025 TeamForge. Part of the VertiGo SaaS platform.
          </div>
        </div>
      </footer>
    </div>
  )
}
