import Link from 'next/link'
import {
  Sparkles,
  Heart,
  Star,
  PartyPopper,
  Cake,
  Music,
  Palette,
  Shield,
  Clock,
  Users
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-partypal-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <PartyPopper className="h-8 w-8 text-partypal-pink-500 animate-wiggle" />
              <span className="text-2xl font-bold bg-gradient-to-r from-partypal-pink-500 to-partypal-yellow-500 bg-clip-text text-transparent">
                PartyPal
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/packages" className="text-gray-700 hover:text-partypal-pink-500 transition-colors">
                Packages
              </Link>
              <Link href="/activities" className="text-gray-700 hover:text-partypal-pink-500 transition-colors">
                Activities
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-partypal-pink-500 transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-partypal-pink-500 transition-colors">
                Contact
              </Link>
            </nav>
            <Link
              href="/admin/login"
              className="bg-gradient-to-r from-partypal-pink-500 to-partypal-yellow-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-partypal-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-partypal-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-partypal-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-8 shadow-lg">
              <Sparkles className="h-5 w-5 text-partypal-yellow-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-700">Trusted by 500+ happy families</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-partypal-pink-500 via-partypal-purple-500 to-partypal-yellow-500 bg-clip-text text-transparent">
                Magical Moments
              </span>
              <br />
              <span className="text-4xl lg:text-6xl">Zero Stress</span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional kids party entertainment that brings joy, laughter, and unforgettable memories to your child's special day.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/packages"
                className="bg-gradient-to-r from-partypal-pink-500 to-partypal-yellow-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all inline-flex items-center space-x-2"
              >
                <PartyPopper className="h-5 w-5" />
                <span>Browse Packages</span>
              </Link>
              <Link
                href="/how-it-works"
                className="bg-white text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all border-2 border-gray-200"
              >
                How It Works
              </Link>
            </div>

            <div className="mt-12 flex justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Background Checked</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Allergy Safe</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-partypal-yellow-500" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Parents <span className="text-partypal-pink-500">Love</span> PartyPal
            </h2>
            <p className="text-xl text-gray-600">Everything you need for a perfect party</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-partypal-pink-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-partypal-pink-100 to-partypal-yellow-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-7 w-7 text-partypal-pink-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Themes Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular <span className="text-partypal-yellow-500">Themes</span>
            </h2>
            <p className="text-xl text-gray-600">From princesses to superheroes</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {themes.map((theme, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className={`h-64 ${theme.bgColor} flex items-center justify-center`}>
                  <span className="text-6xl">{theme.emoji}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-1">{theme.name}</h3>
                    <p className="text-white/80 text-sm">{theme.ageRange}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-partypal-pink-500 to-partypal-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="h-16 w-16 text-white mx-auto mb-6 animate-pulse-slow" />
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Create Magic?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Book your party today and let us handle the fun!
          </p>
          <Link
            href="/packages"
            className="bg-white text-partypal-pink-500 px-10 py-5 rounded-full text-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all inline-block"
          >
            View Packages →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <PartyPopper className="h-6 w-6 text-partypal-pink-400" />
                <span className="text-xl font-bold">PartyPal</span>
              </div>
              <p className="text-gray-400 text-sm">
                Making kids parties magical since 2024
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/packages" className="hover:text-white">Packages</Link></li>
                <li><Link href="/activities" className="hover:text-white">Activities</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/safety" className="hover:text-white">Safety Policy</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-white">Party Tips</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>hello@partypal.com</li>
                <li>+1 (555) 123-4567</li>
                <li>Mon-Fri: 9am-6pm</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 PartyPal. All rights reserved. Built with VertiGo SaaS.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Shield,
    title: 'Safety First',
    description: 'All entertainers are background-checked, first aid certified, and fully insured.'
  },
  {
    icon: Sparkles,
    title: 'Age-Optimized Fun',
    description: 'AI-powered program adaptation ensures activities are perfect for your child\'s age group.'
  },
  {
    icon: Heart,
    title: 'Allergy-Safe',
    description: 'Comprehensive allergy management and safety checks for every activity.'
  },
  {
    icon: Clock,
    title: 'Stress-Free Booking',
    description: 'Simple online booking with instant confirmation and flexible cancellation.'
  },
  {
    icon: Users,
    title: 'Expert Entertainers',
    description: 'Professional animators, magicians, and performers who truly love kids.'
  },
  {
    icon: Music,
    title: 'Complete Packages',
    description: 'From decorations to cake, we handle everything so you can enjoy the party.'
  }
]

const themes = [
  { name: 'Princess Party', emoji: '👸', ageRange: 'Ages 3-8', bgColor: 'bg-pink-200' },
  { name: 'Superhero Adventure', emoji: '🦸', ageRange: 'Ages 4-10', bgColor: 'bg-blue-200' },
  { name: 'Dinosaur World', emoji: '🦕', ageRange: 'Ages 3-7', bgColor: 'bg-green-200' },
  { name: 'Space Explorer', emoji: '🚀', ageRange: 'Ages 5-12', bgColor: 'bg-purple-200' },
  { name: 'Unicorn Magic', emoji: '🦄', ageRange: 'Ages 4-9', bgColor: 'bg-pink-300' },
  { name: 'Pirate Treasure', emoji: '🏴‍☠️', ageRange: 'Ages 5-10', bgColor: 'bg-amber-200' },
  { name: 'Fairy Garden', emoji: '🧚', ageRange: 'Ages 3-7', bgColor: 'bg-emerald-200' },
  { name: 'Science Lab', emoji: '🔬', ageRange: 'Ages 7-12', bgColor: 'bg-cyan-200' },
]
