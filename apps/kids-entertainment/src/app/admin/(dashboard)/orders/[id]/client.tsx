'use client'

/**
 * Order Detail Page - Client Component
 * Handles all UI rendering with @vertigo/ui components
 */

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@vertigo/ui'

interface OrderDetailClientProps {
  order: any
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  return (

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Objednávka {order.orderNumber}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
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
              {order.items.map((item: any) => {
                const name = item.package?.title || item.activity?.title || item.extra?.title || 'Položka'
                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {name}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {item.date} {item.startTime && `od ${item.startTime}`}
                      </p>
                    </div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.price.toLocaleString('cs-CZ')} Kč
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 space-y-2 border-t border-neutral-200 dark:border-neutral-700 pt-4">
              {(() => {
                const pricing = order.pricing as { subtotal?: number; tax?: number; total?: number } | null
                const subtotal = pricing?.subtotal ?? order.items.reduce((sum: number, item: any) => sum + item.price, 0)
                const tax = pricing?.tax ?? Math.round(subtotal * 0.21)
                const total = pricing?.total ?? subtotal + tax
                return (
                  <>
                    <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                      <span>Mezisoučet:</span>
                      <span>{subtotal.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                    <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                      <span>DPH:</span>
                      <span>{tax.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-neutral-900 dark:text-neutral-100">
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
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Jméno</p>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Email</p>
                  <p className="text-neutral-900 dark:text-neutral-100">{order.customer.email}</p>
                </div>
                {order.customer.phone && (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Telefon</p>
                    <p className="text-neutral-900 dark:text-neutral-100">{order.customer.phone}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400">Zákazník není přiřazen</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
