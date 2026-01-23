import {
  Calendar,
  Users,
  CreditCard,
  TrendingUp,
  FileText,
  Smartphone,
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Effortless booking management with automated reminders and calendar sync',
    color: 'bg-blue-500',
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'Complete CRM with progress tracking, measurements, and photo timelines',
    color: 'bg-primary-500',
  },
  {
    icon: CreditCard,
    title: 'Payments & Packages',
    description: 'Flexible pricing with session packages, memberships, and automated billing',
    color: 'bg-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Visual dashboards showing client improvements and business metrics',
    color: 'bg-orange-500',
  },
  {
    icon: FileText,
    title: 'Invoicing',
    description: 'Professional invoices generated automatically, sent via email',
    color: 'bg-pink-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile Access',
    description: 'Manage your business on-the-go with responsive mobile interface',
    color: 'bg-cyan-500',
  },
]

export function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your{' '}
            <span className="text-primary-600">Fitness Business</span>
          </h2>
          <p className="text-xl text-gray-600">
            All the essential tools in one powerful platform. No more juggling
            multiple apps and spreadsheets.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Join thousands of fitness professionals growing their business
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
            See All Features
          </button>
        </div>
      </div>
    </section>
  )
}
