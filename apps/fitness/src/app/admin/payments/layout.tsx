// Force dynamic rendering for all payment pages to avoid build-time database access
export const dynamic = 'force-dynamic'

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
