import { useConfirmContext } from '@/components/ui/confirm-dialog'

export function useConfirm() {
  const confirm = useConfirmContext()

  return {
    confirm,
    confirmDelete: (itemName: string) =>
      confirm({
        title: 'Smazat polozku',
        message: `Opravdu chcete smazat "${itemName}"? Tuto akci nelze vratit.`,
        confirmText: 'Smazat',
        cancelText: 'Zrusit',
        variant: 'danger',
      }),
    confirmAction: (title: string, message: string) =>
      confirm({
        title,
        message,
        confirmText: 'Potvrdit',
        cancelText: 'Zrusit',
        variant: 'warning',
      }),
  }
}
