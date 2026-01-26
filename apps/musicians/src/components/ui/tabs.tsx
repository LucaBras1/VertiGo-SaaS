'use client'

import * as React from 'react'
import { Tab } from '@headlessui/react'
import { cn } from '@/lib/utils'

interface TabsProps {
  children: React.ReactNode
  defaultIndex?: number
  onChange?: (index: number) => void
  className?: string
}

const Tabs = ({ children, defaultIndex = 0, onChange, className }: TabsProps) => {
  return (
    <Tab.Group defaultIndex={defaultIndex} onChange={onChange}>
      <div className={className}>{children}</div>
    </Tab.Group>
  )
}

interface TabListProps {
  children: React.ReactNode
  className?: string
}

const TabList = ({ children, className }: TabListProps) => {
  return (
    <Tab.List
      className={cn(
        'flex space-x-1 rounded-lg bg-gray-100 p-1',
        className
      )}
    >
      {children}
    </Tab.List>
  )
}

interface TabTriggerProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const TabTrigger = ({ children, className, disabled }: TabTriggerProps) => {
  return (
    <Tab
      disabled={disabled}
      className={({ selected }) =>
        cn(
          'w-full rounded-md py-2 px-3 text-sm font-medium leading-5 transition-all',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          selected
            ? 'bg-white text-primary-700 shadow'
            : 'text-gray-600 hover:bg-white/50 hover:text-gray-900',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )
      }
    >
      {children}
    </Tab>
  )
}

interface TabPanelsProps {
  children: React.ReactNode
  className?: string
}

const TabPanels = ({ children, className }: TabPanelsProps) => {
  return <Tab.Panels className={cn('mt-4', className)}>{children}</Tab.Panels>
}

interface TabPanelProps {
  children: React.ReactNode
  className?: string
}

const TabPanel = ({ children, className }: TabPanelProps) => {
  return (
    <Tab.Panel
      className={cn(
        'rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
    >
      {children}
    </Tab.Panel>
  )
}

export { Tabs, TabList, TabTrigger, TabPanels, TabPanel }
