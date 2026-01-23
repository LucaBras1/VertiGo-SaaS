/**
 * Order Detail Page
 */

import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { notFound } from 'next/navigation'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Objednávka {order.orderNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
          </p>
        </div>
        <Badge variant="success">{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Položky objednávky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => {
                const name = item.package?.title || item.activity?.title || item.extra?.title || 'Položka'
                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.date} {item.startTime && `od ${item.startTime}`}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {item.price.toLocaleString('cs-CZ')} Kč
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
              {(() => {
                const pricing = order.pricing as { subtotal?: number; tax?: number; total?: number } | null
                const subtotal = pricing?.subtotal ?? order.items.reduce((sum, item) => sum + item.price, 0)
                const tax = pricing?.tax ?? Math.round(subtotal * 0.21)
                const total = pricing?.total ?? subtotal + tax
                return (
                  <>
                    <div className="flex justify-between text-gray-700">
                      <span>Mezisoučet:</span>
                      <span>{subtotal.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>DPH:</span>
                      <span>{tax.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Celkem:</span>
                      <span>{total.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zákazník</CardTitle>
          </CardHeader>
          <CardContent>
            {order.customer ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Jméno</p>
                  <p className="font-semibold text-gray-900">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{order.customer.email}</p>
                </div>
                {order.customer.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefon</p>
                    <p className="text-gray-900">{order.customer.phone}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Zákazník není přiřazen</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
