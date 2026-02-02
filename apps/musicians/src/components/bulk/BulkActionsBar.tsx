'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Trash2, Download, CheckCircle, XCircle, X } from 'lucide-react'

export interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline'
  requiresConfirmation?: boolean
  confirmTitle?: string
  confirmDescription?: string
  onExecute: (selectedIds: string[]) => Promise<void>
}

interface BulkActionsBarProps {
  selectedCount: number
  selectedIds: Set<string>
  onDeselect: () => void
  actions: BulkAction[]
  entityName?: string // e.g., "gigů", "setlistů"
}

export function BulkActionsBar({
  selectedCount,
  selectedIds,
  onDeselect,
  actions,
  entityName = 'položek',
}: BulkActionsBarProps) {
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  if (selectedCount === 0) return null

  const handleAction = async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setPendingAction(action)
      return
    }
    await executeAction(action)
  }

  const executeAction = async (action: BulkAction) => {
    setIsExecuting(true)
    try {
      await action.onExecute(Array.from(selectedIds))
      onDeselect()
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setIsExecuting(false)
      setPendingAction(null)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
              {selectedCount}
            </span>
            <span className="text-gray-600">vybráno {entityName}</span>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => handleAction(action)}
                disabled={isExecuting}
              >
                {action.icon}
                <span className="ml-1">{action.label}</span>
              </Button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselect}
            disabled={isExecuting}
          >
            <X className="h-4 w-4" />
            <span className="ml-1">Zrušit výběr</span>
          </Button>
        </div>
      </div>

      {pendingAction && (
        <ConfirmDialog
          open={true}
          onClose={() => setPendingAction(null)}
          onConfirm={() => executeAction(pendingAction)}
          title={pendingAction.confirmTitle || 'Potvrdit akci'}
          description={
            pendingAction.confirmDescription ||
            `Opravdu chcete provést tuto akci na ${selectedCount} ${entityName}?`
          }
          variant="danger"
          isLoading={isExecuting}
        />
      )}
    </>
  )
}

// Pre-built action creators for common operations

export function createDeleteAction(
  onDelete: (ids: string[]) => Promise<void>,
  entityName: string
): BulkAction {
  return {
    id: 'delete',
    label: 'Smazat',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    requiresConfirmation: true,
    confirmTitle: 'Smazat vybrané položky?',
    confirmDescription: `Opravdu chcete smazat vybrané ${entityName}? Tato akce je nevratná.`,
    onExecute: onDelete,
  }
}

export function createExportAction(
  onExport: (ids: string[]) => Promise<void>
): BulkAction {
  return {
    id: 'export',
    label: 'Exportovat CSV',
    icon: <Download className="h-4 w-4" />,
    variant: 'outline',
    onExecute: onExport,
  }
}

export function createStatusChangeAction(
  id: string,
  label: string,
  status: string,
  onStatusChange: (ids: string[], status: string) => Promise<void>
): BulkAction {
  return {
    id,
    label,
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'outline',
    onExecute: (ids) => onStatusChange(ids, status),
  }
}
