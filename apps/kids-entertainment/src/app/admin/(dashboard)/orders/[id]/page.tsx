/**
 * Order Detail Page
 * Server component - data fetching only
 */

export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { OrderDetailClient } from './client'

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          package: true,
          activity: true,
          extra: true,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return order
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await getOrder(params.id)

  return <OrderDetailClient order={JSON.parse(JSON.stringify(order))} />
}
