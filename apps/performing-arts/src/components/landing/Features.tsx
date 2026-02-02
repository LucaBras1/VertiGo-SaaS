import {
  Clapperboard,
  Calendar,
  Users,
  FileText,
  Theater,
  Package,
} from 'lucide-react'

const features = [
  {
    icon: Clapperboard,
    title: 'Production Management',
    description:
      'Organize all your productions in one place. Track status, creative team, cast, and crew from planning to closing.',
    color: 'primary',
  },
  {
    icon: Calendar,
    title: 'Rehearsal Scheduling',
    description:
      'Smart scheduling with conflict detection, automatic call sheets, and attendance tracking. Never double-book again.',
    color: 'accent',
  },
  {
    icon: Users,
    title: 'Cast & Crew Management',
    description:
      'Manage your entire team with role assignments, contact info, availability, and understudy tracking.',
    color: 'green',
  },
  {
    icon: FileText,
    title: 'Tech Riders',
    description:
      'Generate professional technical riders with AI. Include stage, sound, lighting, and hospitality requirements.',
    color: 'blue',
  },
  {
    icon: Theater,
    title: 'Venue Database',
    description:
      'Keep track of venues with technical specifications, capacity, contacts, and performance history.',
    color: 'purple',
  },
  {
    icon: Package,
    title: 'Equipment Inventory',
    description:
      'Manage costumes, props, set pieces, and technical equipment. Track condition, location, and assignments.',
    color: 'orange',
  },
]

const colorClasses = {
  primary: {
    bg: 'bg-primary-100',
    icon: 'text-primary-500',
  },
  accent: {
    bg: 'bg-accent-100',
    icon: 'text-accent-600',
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
  },
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
  },
  orange: {
    bg: 'bg-orange-100',
    icon: 'text-orange-600',
  },
}

export function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run a Production
          </h2>
          <p className="text-lg text-gray-600">
            From the first read-through to the final curtain call, StageManager keeps your
            production organized and your team connected.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const colors = colorClasses[feature.color as keyof typeof colorClasses]
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-6`}
                >
                  <feature.icon className={`w-7 h-7 ${colors.icon}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
