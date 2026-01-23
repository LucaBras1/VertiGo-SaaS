/**
 * Edit Page Page
 *
 * Edit an existing static page
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageForm } from '@/components/admin/PageForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

async function getPage(id: string) {
  try {
    return await prisma.page.findUnique({ where: { id } })
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export default async function EditPagePage({ params }: { params: { id: string } }) {
  const page = await getPage(params.id)

  if (!page) {
    notFound()
  }

  const pageData = {
    ...page,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs entityTitle={page.title} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upravit stránku</h1>
        <p className="mt-2 text-sm text-gray-600">{page.title}</p>
      </div>

      <PageForm page={pageData} />
    </div>
  )
}
