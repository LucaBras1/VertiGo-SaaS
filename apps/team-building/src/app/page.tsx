import Link from 'next/link'
import {
  Users,
  Target,
  Sparkles,
  FileText,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-brand-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                TeamForge
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-brand-primary transition-colors">Features</a>
              <a href="#ai-powered" className="text-gray-700 hover:text-brand-primary transition-colors">AI Capabilities</a>
              <a href="#pricing" className="text-gray-700 hover:text-brand-primary transition-colors">Pricing</a>
              <Link href="/login" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-brand-primary px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Powered by Advanced AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 bg-clip-text text-transparent">
            Build Stronger Teams
            <br />
            with AI
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
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

          <p className="text-sm text-gray-500 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-brand-primary mb-2">30k+</div>
              <div className="text-gray-600">Team Building Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-primary mb-2">$4B+</div>
              <div className="text-gray-600">Market Size</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-primary mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-primary mb-2">10x</div>
              <div className="text-gray-600">Faster Reports</div>
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
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four specialized AI modules that transform how you design and deliver team building experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* TeamDynamicsAI */}
            <div className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">TeamDynamicsAI</h3>
                  <p className="text-gray-600 mb-4">
                    Analyze team composition, size, and dynamics to suggest the most appropriate activities.
                    Gets smarter with every session.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Analyzes team size, industry, and composition
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Suggests optimal activity sequences
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
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
                  <p className="text-gray-600 mb-4">
                    Match corporate objectives (communication, trust, leadership) to activities with
                    precision scoring and evidence-based recommendations.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Maps objectives to learning outcomes
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Provides alignment scores (0-100)
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
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
                  <p className="text-gray-600 mb-4">
                    Automatically adjust activity difficulty based on team's physical capabilities,
                    age range, and experience level.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Adaptive difficulty scaling
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Real-time facilitator guidance
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
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
                  <p className="text-gray-600 mb-4">
                    Generate professional, HR-ready post-session reports with team dynamics analysis,
                    recommendations, and next steps.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Executive summaries
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Objective achievement tracking
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
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
      <section id="features" className="py-24 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for corporate team building companies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Objective-Based Matching</h3>
              <p className="text-gray-600">
                Match corporate goals (communication, trust, leadership) to the perfect activities
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Team Analytics</h3>
              <p className="text-gray-600">
                Track team dynamics, engagement patterns, and development over time
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Corporate Invoicing</h3>
              <p className="text-gray-600">
                Professional invoicing, payment tracking, and financial reporting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Team Building Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of team building professionals using AI to deliver better experiences
          </p>
          <Link href="/signup" className="btn-primary inline-flex items-center gap-2 text-lg">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            14-day trial • No credit card • Full access to all AI features
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-brand-primary" />
                <span className="text-xl font-bold">TeamForge</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered team building management for corporate providers
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#ai-powered" className="hover:text-white">AI Capabilities</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/demo" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="/careers" className="hover:text-white">Careers</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms</a></li>
                <li><a href="/security" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 TeamForge. Part of the VertiGo SaaS platform.
          </div>
        </div>
      </footer>
    </div>
  )
}
