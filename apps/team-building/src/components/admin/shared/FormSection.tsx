'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { staggerItem } from '@vertigo/ui'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <motion.div variants={staggerItem}>
      <Card>
        <div className="mb-5">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {children}
        </div>
      </Card>
    </motion.div>
  )
}
