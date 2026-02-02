import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small theater groups',
    price: 'Free',
    period: '',
    features: [
      '2 productions',
      '5 team members',
      'Basic scheduling',
      'Tech rider templates',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    description: 'For active theater companies',
    price: '$29',
    period: '/month',
    features: [
      'Unlimited productions',
      '25 team members',
      'AI Tech Rider Generator',
      'AI Rehearsal Scheduler',
      'Venue management',
      'Call sheet automation',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited everything',
      'Unlimited team members',
      'All AI features',
      'Custom integrations',
      'Dedicated account manager',
      'On-premise option',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Start free, upgrade when you need more. No hidden fees, no long-term contracts.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-xl shadow-primary-500/25 scale-105'
                  : 'bg-white shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-accent-400 text-gray-900 text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    plan.highlighted ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>
                <p className={plan.highlighted ? 'text-primary-100' : 'text-gray-500'}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span
                  className={`text-4xl font-bold ${
                    plan.highlighted ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.price}
                </span>
                <span className={plan.highlighted ? 'text-primary-100' : 'text-gray-500'}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.highlighted ? 'bg-white/20' : 'bg-green-100'
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.highlighted ? 'text-white' : 'text-green-600'
                        }`}
                      />
                    </div>
                    <span className={plan.highlighted ? 'text-white' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-white text-primary-600 hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
