import { Check, Zap, Crown } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '29',
    description: 'Perfect for independent trainers',
    icon: Zap,
    features: [
      'Up to 30 active clients',
      '100 AI workout generations/mo',
      'Basic scheduling & booking',
      'Client progress tracking',
      'Email support',
      'Mobile app access',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '79',
    description: 'For growing fitness businesses',
    icon: Crown,
    features: [
      'Unlimited clients',
      'Unlimited AI generations',
      'Advanced analytics & insights',
      'Churn prediction AI',
      'Class scheduling',
      'Package & membership management',
      'Custom branding',
      'Priority support',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Studio',
    price: '199',
    description: 'For studios & multi-trainer teams',
    icon: Crown,
    features: [
      'Everything in Professional',
      'Multi-trainer accounts',
      'Team collaboration tools',
      'White-label options',
      'Advanced integrations',
      'Dedicated account manager',
      'Custom onboarding',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export function Pricing() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent{' '}
            <span className="text-primary-600">Pricing</span>
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your business. All plans include 14-day free trial.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-2xl scale-105'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-300 text-secondary-800 text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`inline-flex p-3 rounded-xl mb-4 ${
                    plan.popular
                      ? 'bg-white/20'
                      : 'bg-primary-100'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      plan.popular ? 'text-white' : 'text-primary-600'
                    }`}
                  />
                </div>

                {/* Plan name */}
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    plan.popular ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>

                {/* Description */}
                <p
                  className={`mb-6 ${
                    plan.popular ? 'text-white/90' : 'text-gray-600'
                  }`}
                >
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span
                    className={`text-5xl font-bold ${
                      plan.popular ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${plan.price}
                  </span>
                  <span
                    className={`${
                      plan.popular ? 'text-white/80' : 'text-gray-500'
                    }`}
                  >
                    /month
                  </span>
                </div>

                {/* CTA button */}
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold mb-8 transition-all ${
                    plan.popular
                      ? 'bg-white text-primary-600 hover:bg-gray-50'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.popular ? 'text-yellow-300' : 'text-primary-600'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.popular ? 'text-white/90' : 'text-gray-600'
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
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">All plans include 14-day free trial. No credit card required.</p>
          <p>Need a custom plan? <a href="/contact" className="text-primary-600 font-semibold hover:underline">Contact us</a></p>
        </div>
      </div>
    </section>
  )
}
