'use client';

import * as React from 'react';
import { Tab, TabGroup, TabList as HeadlessTabList, TabPanels as HeadlessTabPanels, TabPanel as HeadlessTabPanel } from '@headlessui/react';
import { cn } from '../utils';

interface TabsProps {
  children: React.ReactNode;
  defaultIndex?: number;
  selectedIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
}

function Tabs({ children, defaultIndex = 0, selectedIndex, onChange, className }: TabsProps) {
  const controlledProps = selectedIndex !== undefined
    ? { selectedIndex, onChange }
    : { defaultIndex, onChange };

  return (
    <TabGroup {...controlledProps}>
      <div className={className}>{children}</div>
    </TabGroup>
  );
}
Tabs.displayName = 'Tabs';

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

function TabList({ children, className }: TabListProps) {
  return (
    <HeadlessTabList
      className={cn(
        'flex space-x-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800',
        className
      )}
    >
      {children}
    </HeadlessTabList>
  );
}
TabList.displayName = 'TabList';

interface TabTriggerProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function TabTrigger({ children, className, disabled }: TabTriggerProps) {
  return (
    <Tab
      disabled={disabled}
      className={({ selected }) =>
        cn(
          'w-full rounded-md py-2 px-3 text-sm font-medium leading-5 transition-all',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900',
          selected
            ? 'bg-white text-brand-700 shadow dark:bg-neutral-700 dark:text-brand-300'
            : 'text-neutral-600 hover:bg-white/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700/50 dark:hover:text-neutral-200',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )
      }
    >
      {children}
    </Tab>
  );
}
TabTrigger.displayName = 'TabTrigger';

interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

function TabPanels({ children, className }: TabPanelsProps) {
  return <HeadlessTabPanels className={cn('mt-4', className)}>{children}</HeadlessTabPanels>;
}
TabPanels.displayName = 'TabPanels';

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

function TabPanel({ children, className }: TabPanelProps) {
  return (
    <HeadlessTabPanel
      className={cn(
        'rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500',
        className
      )}
    >
      {children}
    </HeadlessTabPanel>
  );
}
TabPanel.displayName = 'TabPanel';

export { Tabs, TabList, TabTrigger, TabPanels, TabPanel };
