import { PostForm } from '@/components/admin/PostForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

export default function NewPostPage() {
  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nová aktualita</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vytvořte nový blogový příspěvek nebo novinku
        </p>
      </div>

      <PostForm />
    </div>
  )
}
