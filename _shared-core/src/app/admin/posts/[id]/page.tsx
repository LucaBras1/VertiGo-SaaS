import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PostForm } from '@/components/admin/PostForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

async function getPost(id: string) {
  try {
    return await prisma.post.findUnique({ where: { id } })
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  const postData = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() || null,
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs entityTitle={post.title} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upravit aktualitu</h1>
        <p className="mt-2 text-sm text-gray-600">{post.title}</p>
      </div>

      <PostForm post={postData} />
    </div>
  )
}
