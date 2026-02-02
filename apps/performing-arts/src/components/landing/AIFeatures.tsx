import { Sparkles, FileText, Calendar, UserCheck } from 'lucide-react'

const aiFeatures = [
  {
    icon: FileText,
    title: 'Tech Rider Generator',
    description:
      'Generate comprehensive technical riders in seconds. Our AI analyzes your production type, cast size, and technical needs to create professional, venue-ready documents.',
    features: [
      'Stage & sound requirements',
      'Lighting & rigging specs',
      'Hospitality & dressing rooms',
      'Load-in schedules',
    ],
  },
  {
    icon: Calendar,
    title: 'Rehearsal Scheduler',
    description:
      'Let AI plan your rehearsal schedule. It considers scene dependencies, performer availability, and optimal learning progressions.',
    features: [
      'Conflict detection',
      'Scene dependency ordering',
      'Automatic call sheets',
      'Venue availability check',
    ],
  },
  {
    icon: UserCheck,
    title: 'Casting Assistant',
    description:
      'Streamline your casting process with AI-powered role matching, audition scheduling, and chemistry analysis.',
    features: [
      'Role requirements matching',
      'Audition slot optimization',
      'Understudy recommendations',
      'Ensemble balancing',
    ],
  },
]

export function AIFeatures() {
  return (
    <section id="ai" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by AI
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI That Understands Theater
          </h2>
          <p className="text-lg text-gray-600">
            Our AI modules are trained on thousands of productions and industry best practices.
            Save time on administrative tasks and focus on what matters - creating great art.
          </p>
        </div>

        {/* AI features */}
        <div className="space-y-16">
          {aiFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col lg:flex-row gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-6 shadow-lg shadow-primary-500/25">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual placeholder */}
              <div className="flex-1 w-full">
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-8 aspect-[4/3] flex items-center justify-center border border-gray-200">
                  <div className="text-center">
                    <feature.icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">{feature.title} Preview</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
