import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ServiceForm } from '@/components/admin/ServiceForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

async function getService(id: string) {
  try {
    return await prisma.service.findUnique({ where: { id } })
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const service = await getService(params.id)

  if (!service) {
    notFound()
  }

  const serviceData = {
    ...service,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs entityTitle={service.title} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upravit službu</h1>
        <p className="mt-2 text-sm text-gray-600">{service.title}</p>
      </div>

      <ServiceForm service={serviceData} />
    </div>
  )
}
