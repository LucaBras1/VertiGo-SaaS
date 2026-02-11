'use client';

import * as React from 'react';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem as HeadlessMenuItem,
  Transition,
} from '@headlessui/react';
import { cn } from '../utils';

const DropdownMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Menu as="div" ref={ref} className={cn('relative', className)} {...props} />
));
DropdownMenu.displayName = 'DropdownMenu';

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, ...props }, ref) => (
  <MenuButton
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20',
      className
    )}
    {...props}
  />
));
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

interface DropdownMenuItemsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
}

const DropdownMenuItems = React.forwardRef<HTMLDivElement, DropdownMenuItemsProps>(
  ({ className, align = 'end', ...props }, ref) => (
    <Transition
      as={React.Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <MenuItems
        ref={ref}
        className={cn(
          'absolute z-50 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none',
          'dark:bg-neutral-900 dark:ring-white/10',
          'divide-y divide-neutral-100 dark:divide-neutral-800',
          align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
          className
        )}
        {...props}
      />
    </Transition>
  )
);
DropdownMenuItems.displayName = 'DropdownMenuItems';

interface DropdownMenuItemProps {
  children: React.ReactNode | ((props: { active: boolean }) => React.ReactNode);
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  onClick?: () => void;
  as?: React.ElementType;
  href?: string;
}

function DropdownMenuItem({
  children,
  className,
  variant = 'default',
  onClick,
  as: Component,
  href,
  disabled: disabledProp,
}: DropdownMenuItemProps) {
  return (
    <HeadlessMenuItem as={React.Fragment} disabled={disabledProp}>
      {({ active, disabled }: { active: boolean; disabled: boolean }) => {
        if (typeof children === 'function') {
          return children({ active }) as React.ReactElement;
        }

        const baseClasses = cn(
          'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          variant === 'destructive'
            ? active
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : 'text-red-600 dark:text-red-400'
            : active
              ? 'bg-neutral-50 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
              : 'text-neutral-700 dark:text-neutral-300',
          className
        );

        if (Component) {
          return <Component className={baseClasses} href={href} onClick={onClick}>{children}</Component>;
        }

        return (
          <button type="button" className={baseClasses} onClick={onClick}>
            {children}
          </button>
        );
      }}
    </HeadlessMenuItem>
  );
}
DropdownMenuItem.displayName = 'DropdownMenuItem';

function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-px bg-neutral-100 dark:bg-neutral-800', className)}
      role="separator"
    />
  );
}
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <div className={cn('px-4 py-3', className)}>
      {children}
    </div>
  );
}
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

interface DropdownMenuGroupProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownMenuGroup({ children, className }: DropdownMenuGroupProps) {
  return <div className={cn('py-1', className)}>{children}</div>;
}
DropdownMenuGroup.displayName = 'DropdownMenuGroup';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItems,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
};
