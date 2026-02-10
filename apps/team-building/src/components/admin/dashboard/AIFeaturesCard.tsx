'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Brain, Target, Sparkles, ArrowRight } from 'lucide-react'
import { Card, fadeIn, hoverLift, pulseAttention } from '@vertigo/ui'

const aiFeatures = [
  {
    title: 'Team Dynamics Analysis',
    description: 'AI recommendations for team composition and activities',
    href: '/admin/ai/team-analysis',
    icon: Brain,
  },
  {
    title: 'Objective Matcher',
    description: 'Match corporate goals to the perfect activities',
    href: '/admin/ai/objective-matcher',
    icon: Target,
  },
]

export function AIFeaturesCard() {
  return (
    <motion.div {...fadeIn}>
      <Card className="relative overflow-hidden border-brand-200 bg-gradient-to-br from-violet-50/80 to-blue-50/80 dark:border-brand-800 dark:from-violet-950/30 dark:to-blue-950/30">
        {/* Glow effect */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-violet-400/20 to-blue-400/20 blur-3xl" />

        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <motion.div {...pulseAttention}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">AI-Powered Features</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Optimize your team building with AI</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {aiFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.title} href={feature.href}>
                  <motion.div
                    {...hoverLift}
                    className="group rounded-xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-brand-200 hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-900/80 dark:hover:border-brand-700"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 text-brand-600 dark:text-brand-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{feature.title}</h3>
                          <ArrowRight className="h-3.5 w-3.5 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
