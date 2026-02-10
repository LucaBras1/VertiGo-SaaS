/**
 * Edit Package Page
 * Edit existing party package
 */

export const dynamic = 'force-dynamic'

import PackageForm from '@/components/admin/PackageForm'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

async function getPackage(id: string) {
  const pkg = await prisma.package.findUnique({
    where: { id },
  })

  if (!pkg) {
    notFound()
  }

  return pkg
}

export default async function EditPackagePage({
  params,
}: {
  params: { id: string }
}) {
  const pkg = await getPackage(params.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Upravit balíček</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">{pkg.title}</p>
      </div>

      <PackageForm initialData={pkg} packageId={pkg.id} />
    </div>
  )
}
