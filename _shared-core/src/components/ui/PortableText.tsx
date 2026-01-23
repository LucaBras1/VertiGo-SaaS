import { PortableText as PortableTextReact } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import Image from 'next/image'

interface PortableTextProps {
  value: PortableTextBlock[]
}

// Get image URL from various formats
function getImageUrl(value: any): string | null {
  if (!value) return null

  // Direct URL format (Prisma)
  if (value.url && typeof value.url === 'string') {
    return value.url
  }

  // Asset with direct URL
  if (value.asset) {
    // Direct URL on asset
    if (value.asset.url && typeof value.asset.url === 'string') {
      return value.asset.url
    }
    // Sanity reference format - can't resolve without Sanity client
    // Skip these images as we're migrating away from Sanity
    if (value.asset._ref) {
      console.warn('Sanity image reference found in PortableText - cannot resolve without Sanity client')
      return null
    }
  }

  return null
}

const components = {
  block: {
    normal: ({ children }: any) => (
      <p className="text-neutral-700 leading-relaxed mb-4">{children}</p>
    ),
    h1: ({ children }: any) => (
      <h1 className="text-4xl font-serif font-bold text-neutral-900 mb-6 mt-8">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4 mt-6">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-serif font-bold text-neutral-900 mb-3 mt-5">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-xl font-semibold text-neutral-900 mb-2 mt-4">
        {children}
      </h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-neutral-600 my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-2 text-neutral-700 mb-4">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-2 text-neutral-700 mb-4">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li className="ml-4">{children}</li>,
    number: ({ children }: any) => <li className="ml-4">{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-neutral-900">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-neutral-100 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <a
        href={value?.href}
        className="text-primary hover:text-primary-dark underline transition-colors"
        target={value?.href?.startsWith('http') ? '_blank' : '_self'}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => {
      const imageUrl = getImageUrl(value)
      if (!imageUrl) return null

      return (
        <div className="my-6 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={value.alt || 'Obrázek'}
            width={800}
            height={600}
            className="w-full h-auto"
          />
          {value.caption && (
            <p className="text-sm text-neutral-500 text-center mt-2 italic">
              {value.caption}
            </p>
          )}
        </div>
      )
    },
  },
}

export default function PortableText({ value }: PortableTextProps) {
  if (!value || value.length === 0) return null

  return <PortableTextReact value={value} components={components} />
}
