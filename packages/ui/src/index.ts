'use client';

/**
 * @vertigo/ui
 * Shared UI components for VertiGo SaaS platform
 *
 * Award-winning design system with micro-interactions,
 * premium variants, and consistent motion design.
 */

// --- Core Components ---
export { Button, buttonVariants } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/Card';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalBody,
} from './components/Modal';

export { DataTable } from './components/DataTable';
export type { DataTableProps, Column, SortDirection } from './components/DataTable';

export { LoadingSpinner } from './components/LoadingSpinner';

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonDashboard } from './components/Skeleton';

export { EmptyState } from './components/EmptyState';
export type { EmptyStateProps } from './components/EmptyState';

export { Badge, badgeVariants } from './components/Badge';
export type { BadgeProps } from './components/Badge';

export { Label } from './components/Label';
export type { LabelProps } from './components/Label';

export { Textarea } from './components/Textarea';
export type { TextareaProps } from './components/Textarea';

export { Checkbox } from './components/Checkbox';
export type { CheckboxProps } from './components/Checkbox';

export { Select } from './components/Select';
export type { SelectProps, SelectOption, SelectOptionType } from './components/Select';

export { ConfirmDialog } from './components/ConfirmDialog';
export type { ConfirmDialogProps } from './components/ConfirmDialog';

export { ConfirmDialogProvider, useConfirmContext, useConfirmDefaults } from './components/ConfirmDialogProvider';
export type { ConfirmDialogProviderProps, ConfirmOptions, ConfirmDefaults } from './components/ConfirmDialogProvider';

export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from './components/Dialog';

export { Tabs, TabList, TabTrigger, TabPanels, TabPanel } from './components/Tabs';

export { DatePicker } from './components/DatePicker';
export type { DatePickerProps } from './components/DatePicker';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItems,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from './components/DropdownMenu';

// --- AI Components ---
export { AIAssistantWidget } from './components/AIAssistantWidget';
export { AIQuoteSuggestion } from './components/AIQuoteSuggestion';
export { AIDraftEditor } from './components/AIDraftEditor';
export { AIInsightsPanel } from './components/AIInsightsPanel';
export { ConversationalBooking } from './components/ConversationalBooking';

// --- Pricing Components ---
export {
  PricingCard,
  PricingToggle,
  PricingTable,
  defaultTiers,
} from './components/pricing';
export type {
  PricingCardProps,
  PricingToggleProps,
  PricingTableProps,
  TierConfig,
  SubscriptionTier,
  BillingInterval,
} from './components/pricing';

// --- Animations ---
export {
  // Transitions
  fadeIn,
  fadeInProps,
  slideUp,
  slideUpProps,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  scaleInProps,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  staggerItemScale,
  pageTransition,
  modalOverlay,
  modalContent,
  sheetBottom,
  sheetRight,
  tooltip,
  collapse,
  // Interactions
  hoverScale,
  hoverScaleLg,
  hoverLift,
  hoverLiftLg,
  pressScale,
  pressScaleLg,
  focusRing,
  hoverGlow,
  hoverGlowAi,
  hoverRotate,
  hoverTilt,
  counterSpring,
  pulseAttention,
  shakeError,
  // Loading
  shimmerEffect,
  pulseLoading,
  loadingDot,
  spinnerRotation,
  progressBar,
  skeletonWidths,
} from './animations';

// --- Hooks ---
export { useAIChat } from './hooks/useAIChat';
export { useAICompletion } from './hooks/useAICompletion';
export { useVerticalTheme } from './hooks/useVerticalTheme';
export { useConfirm } from './hooks/useConfirm';

// --- Types ---
export type { AIMessage, AIWidgetProps, QuoteSuggestion, InsightData, ThemeConfig } from './types';

// --- Utils ---
export { cn, formatCurrency, formatDate, truncate } from './utils';
