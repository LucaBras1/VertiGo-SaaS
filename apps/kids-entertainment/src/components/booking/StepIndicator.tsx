/**
 * Step Indicator Component
 * Shows progress through booking wizard steps
 */

'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  name: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
              'relative'
            )}
          >
            {step.id < currentStep ? (
              // Completed step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-partypal-pink-500" />
                </div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-partypal-pink-500">
                  <Check className="h-5 w-5 text-white" />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            ) : step.id === currentStep ? (
              // Current step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-partypal-pink-500 bg-white"
                  aria-current="step"
                >
                  <span className="text-partypal-pink-500 font-semibold">{step.id}</span>
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            ) : (
              // Future step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                  <span className="text-gray-500">{step.id}</span>
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            )}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span
                className={cn(
                  'text-xs font-medium',
                  step.id === currentStep
                    ? 'text-partypal-pink-600'
                    : step.id < currentStep
                    ? 'text-gray-600'
                    : 'text-gray-400'
                )}
              >
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
