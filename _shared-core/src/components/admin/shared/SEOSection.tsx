'use client'

import { Search, Image as ImageIcon } from 'lucide-react'
import { ImageUpload } from '../ImageUpload'

export interface SEOData {
  metaTitle: string
  metaDescription: string
  ogImageUrl: string
}

interface SEOSectionProps {
  seo: SEOData
  onChange: (seo: SEOData) => void
  defaultTitle?: string
  defaultDescription?: string
}

export function SEOSection({ seo, onChange, defaultTitle, defaultDescription }: SEOSectionProps) {
  const updateField = (field: keyof SEOData, value: string) => {
    onChange({ ...seo, [field]: value })
  }

  const metaTitleLength = seo.metaTitle?.length || 0
  const metaDescLength = seo.metaDescription?.length || 0

  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO nastavení
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Optimalizace pro vyhledávače a sociální sítě.
          </p>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
          {/* Meta Title */}
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
              Meta titulek
            </label>
            <input
              type="text"
              id="metaTitle"
              value={seo.metaTitle || ''}
              onChange={(e) => updateField('metaTitle', e.target.value)}
              placeholder={defaultTitle || 'Ponechte prázdné pro výchozí název'}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-gray-500">
                {defaultTitle && !seo.metaTitle && `Výchozí: "${defaultTitle}"`}
              </span>
              <span className={metaTitleLength > 60 ? 'text-red-500' : 'text-gray-500'}>
                {metaTitleLength}/60 znaků
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
              Meta popis
            </label>
            <textarea
              id="metaDescription"
              rows={3}
              value={seo.metaDescription || ''}
              onChange={(e) => updateField('metaDescription', e.target.value)}
              placeholder={defaultDescription || 'Krátký popis pro výsledky vyhledávání'}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-gray-500">
                {defaultDescription && !seo.metaDescription && `Výchozí: "${defaultDescription.substring(0, 50)}..."`}
              </span>
              <span className={metaDescLength > 160 ? 'text-red-500' : 'text-gray-500'}>
                {metaDescLength}/160 znaků
              </span>
            </div>
          </div>

          {/* OG Image */}
          <div>
            <ImageUpload
              label="OG obrázek (pro sdílení na sociálních sítích)"
              value={seo.ogImageUrl || ''}
              onChange={(url) => updateField('ogImageUrl', url)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Doporučený rozměr: 1200x630px. Pokud není nastaven, použije se hlavní obrázek.
            </p>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2 font-medium">Náhled ve vyhledávači:</p>
            <div className="space-y-1">
              <div className="text-blue-700 text-lg hover:underline cursor-pointer truncate">
                {seo.metaTitle || defaultTitle || 'Název stránky'}
              </div>
              <div className="text-green-700 text-sm">
                divadlo-studna.cz › ...
              </div>
              <div className="text-gray-600 text-sm line-clamp-2">
                {seo.metaDescription || defaultDescription || 'Popis stránky se zobrazí zde...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
