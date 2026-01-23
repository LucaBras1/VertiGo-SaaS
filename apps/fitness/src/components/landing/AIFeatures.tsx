import { Brain, Target, Apple, AlertTriangle, Sparkles } from 'lucide-react'

const aiFeatures = [
  {
    icon: Brain,
    title: 'WorkoutAI',
    description: 'Generate personalized training plans in seconds',
    details: [
      'Adapts to fitness level and goals',
      'Considers injuries and equipment',
      'Progressive overload built-in',
      'Exercise alternatives included',
    ],
    badge: 'MOST POPULAR',
    badgeColor: 'bg-primary-500',
  },
  {
    icon: Target,
    title: 'Progress Predictor',
    description: 'AI predicts when clients will reach their goals',
    details: [
      'Analyzes adherence patterns',
      'Forecasts weight/strength milestones',
      'Suggests adjustment strategies',
      'Confidence scoring',
    ],
    badge: 'NEW',
    badgeColor: 'bg-blue-500',
  },
  {
    icon: Apple,
    title: 'Nutrition Advisor',
    description: 'Basic macro and calorie guidance for clients',
    details: [
      'Calculates TDEE and macros',
      'Meal timing suggestions',
      'Hydration recommendations',
      'Dietary restriction support',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Churn Detector',
    description: 'Identifies at-risk clients before they leave',
    details: [
      'Tracks attendance patterns',
      'Engagement scoring',
      'Automated outreach triggers',
      'Retention recommendations',
    ],
    badge: 'PRO',
    badgeColor: 'bg-purple-500',
  },
]

export function AIFeatures() {
  return (
    <section className="py-20 bg-gradient-to-br from-secondary-800 to-secondary-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-primary-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
            <span className="text-sm font-medium text-yellow-300">AI-POWERED FEATURES</span>
          </div>

          <h2 className="text-4xl font-bold mb-4">
            Your AI{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-yellow-300">
              Co-Trainer
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Advanced artificial intelligence that works 24/7 to help you deliver
            better results and grow your business.
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {aiFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all group"
              >
                {/* Badge */}
                {feature.badge && (
                  <div
                    className={`absolute top-4 right-4 ${feature.badgeColor} text-xs font-bold px-3 py-1 rounded-full`}
                  >
                    {feature.badge}
                  </div>
                )}

                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-300 mb-6">{feature.description}</p>

                {/* Details */}
                <ul className="space-y-2">
                  {feature.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <svg
                        className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Bottom stats */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 pt-16 border-t border-white/10">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-400 mb-2">500K+</div>
            <div className="text-gray-300">AI Workouts Generated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-400 mb-2">95%</div>
            <div className="text-gray-300">Client Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-400 mb-2">30 hrs</div>
            <div className="text-gray-300">Avg. Time Saved/Month</div>
          </div>
        </div>
      </div>
    </section>
  )
}
