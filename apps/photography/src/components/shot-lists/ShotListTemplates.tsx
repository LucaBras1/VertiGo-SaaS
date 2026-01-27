'use client'

import { X, Heart, Users, Camera, Briefcase, Baby, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ShotCategory } from './ShotListEditor'
import { ShotItem } from './ShotListItem'

interface ShotListTemplatesProps {
  onSelect: (template: ShotCategory[]) => void
  onClose: () => void
}

// Helper to create items with unique IDs
function createItem(
  title: string,
  priority: ShotItem['priority'] = 'nice-to-have',
  timeSlot?: string,
  notes?: string
): ShotItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    priority,
    timeSlot,
    notes
  }
}

const templates = [
  {
    id: 'wedding',
    name: 'Svatba',
    description: 'Kompletní shot list pro svatební den',
    icon: Heart,
    categories: [
      {
        id: 'getting-ready',
        name: 'Přípravy',
        color: 'bg-pink-500',
        items: [
          createItem('Nevěsta v županu', 'must-have', '09:00'),
          createItem('Detail šatů na ramínku', 'must-have'),
          createItem('Svatební boty', 'nice-to-have'),
          createItem('Kytice', 'must-have'),
          createItem('Detail prstenů', 'must-have'),
          createItem('Make-up nevěsty', 'nice-to-have'),
          createItem('Účes nevěsty', 'nice-to-have'),
          createItem('Nevěsta se svědkyní', 'must-have'),
          createItem('Ženich s družbou', 'nice-to-have'),
          createItem('Emotivní moment oblékání', 'creative')
        ]
      },
      {
        id: 'ceremony',
        name: 'Obřad',
        color: 'bg-purple-500',
        items: [
          createItem('Příchod ženicha', 'must-have', '14:00'),
          createItem('Příchod nevěsty', 'must-have', '14:05'),
          createItem('Výměna prstenů', 'must-have'),
          createItem('První polibek', 'must-have'),
          createItem('Podpis', 'must-have'),
          createItem('Oddávající', 'nice-to-have'),
          createItem('Reakce hostů', 'creative'),
          createItem('Detail na ruce s prsteny', 'nice-to-have'),
          createItem('Gratulace rodičů', 'must-have')
        ]
      },
      {
        id: 'portraits',
        name: 'Portréty',
        color: 'bg-blue-500',
        items: [
          createItem('Novomanželé - klasický portrét', 'must-have', '15:00'),
          createItem('Novomanželé - romantický', 'must-have'),
          createItem('S rodiči nevěsty', 'must-have'),
          createItem('S rodiči ženicha', 'must-have'),
          createItem('Širší rodina nevěsty', 'nice-to-have'),
          createItem('Širší rodina ženicha', 'nice-to-have'),
          createItem('Se svědky', 'must-have'),
          createItem('Skupinové foto všech hostů', 'must-have'),
          createItem('Kreativní portrét v přírodě', 'creative')
        ]
      },
      {
        id: 'reception',
        name: 'Hostina',
        color: 'bg-green-500',
        items: [
          createItem('Příchod novomanželů', 'must-have', '17:00'),
          createItem('První tanec', 'must-have'),
          createItem('Krájení dortu', 'must-have'),
          createItem('Přípitek', 'must-have'),
          createItem('Házení kytice', 'nice-to-have'),
          createItem('Tančící hosté', 'nice-to-have'),
          createItem('Večerní párový portrét', 'creative', '21:00')
        ]
      },
      {
        id: 'details',
        name: 'Detaily',
        color: 'bg-amber-500',
        items: [
          createItem('Výzdoba místa obřadu', 'nice-to-have'),
          createItem('Výzdoba hostiny', 'nice-to-have'),
          createItem('Svatební dort', 'must-have'),
          createItem('Jmenovky a menu', 'nice-to-have'),
          createItem('Květinová výzdoba', 'nice-to-have'),
          createItem('Auto novomanželů', 'nice-to-have')
        ]
      }
    ] as ShotCategory[]
  },
  {
    id: 'family',
    name: 'Rodinné focení',
    description: 'Shot list pro rodinné portréty',
    icon: Users,
    categories: [
      {
        id: 'group',
        name: 'Skupinové',
        color: 'bg-blue-500',
        items: [
          createItem('Celá rodina - formální', 'must-have'),
          createItem('Celá rodina - veselé', 'must-have'),
          createItem('Rodiče s dětmi', 'must-have'),
          createItem('Jen děti', 'must-have'),
          createItem('Prarodiče s vnoučaty', 'nice-to-have')
        ]
      },
      {
        id: 'individual',
        name: 'Jednotlivci',
        color: 'bg-green-500',
        items: [
          createItem('Portrét každého dítěte', 'must-have'),
          createItem('Rodiče spolu', 'must-have'),
          createItem('Spontánní momenty', 'creative')
        ]
      },
      {
        id: 'lifestyle',
        name: 'Lifestyle',
        color: 'bg-amber-500',
        items: [
          createItem('Hraní si spolu', 'nice-to-have'),
          createItem('Objetí', 'must-have'),
          createItem('Smích', 'must-have'),
          createItem('Procházka', 'nice-to-have')
        ]
      }
    ] as ShotCategory[]
  },
  {
    id: 'portrait',
    name: 'Portrétní focení',
    description: 'Individuální nebo párové portréty',
    icon: Camera,
    categories: [
      {
        id: 'classic',
        name: 'Klasické portréty',
        color: 'bg-gray-500',
        items: [
          createItem('Headshot - přední', 'must-have'),
          createItem('Headshot - 3/4 profil', 'must-have'),
          createItem('Celá postava', 'must-have'),
          createItem('Horní polovina', 'nice-to-have')
        ]
      },
      {
        id: 'creative',
        name: 'Kreativní',
        color: 'bg-purple-500',
        items: [
          createItem('Dramatické světlo', 'creative'),
          createItem('Silhoueta', 'creative'),
          createItem('Motion blur', 'creative'),
          createItem('Double exposure', 'creative')
        ]
      },
      {
        id: 'mood',
        name: 'Nálady',
        color: 'bg-pink-500',
        items: [
          createItem('Upřímný úsměv', 'must-have'),
          createItem('Zamyšlený pohled', 'nice-to-have'),
          createItem('Smích', 'must-have'),
          createItem('Vážný výraz', 'nice-to-have')
        ]
      }
    ] as ShotCategory[]
  },
  {
    id: 'corporate',
    name: 'Firemní focení',
    description: 'Profesionální firemní portréty a týmové fotky',
    icon: Briefcase,
    categories: [
      {
        id: 'headshots',
        name: 'Business portréty',
        color: 'bg-blue-500',
        items: [
          createItem('Formální headshot - bílé pozadí', 'must-have'),
          createItem('Formální headshot - šedé pozadí', 'nice-to-have'),
          createItem('Lifestyle headshot - kancelář', 'nice-to-have'),
          createItem('3/4 portrét', 'must-have')
        ]
      },
      {
        id: 'team',
        name: 'Týmové',
        color: 'bg-green-500',
        items: [
          createItem('Celý tým - formální', 'must-have'),
          createItem('Tým v akci', 'nice-to-have'),
          createItem('Oddělení jednotlivě', 'nice-to-have'),
          createItem('Leadership tým', 'must-have')
        ]
      },
      {
        id: 'environment',
        name: 'Prostředí',
        color: 'bg-amber-500',
        items: [
          createItem('Exteriér budovy', 'nice-to-have'),
          createItem('Recepce/vstup', 'nice-to-have'),
          createItem('Meeting room', 'nice-to-have'),
          createItem('Pracovní prostředí', 'nice-to-have')
        ]
      }
    ] as ShotCategory[]
  },
  {
    id: 'newborn',
    name: 'Novorozenecké',
    description: 'Shot list pro focení miminek',
    icon: Baby,
    categories: [
      {
        id: 'baby-solo',
        name: 'Miminko',
        color: 'bg-pink-500',
        items: [
          createItem('Spící miminko - detail obličeje', 'must-have'),
          createItem('Spící v košíku/peřince', 'must-have'),
          createItem('Detail ručiček', 'must-have'),
          createItem('Detail nožiček', 'must-have'),
          createItem('Probuzené - oči', 'nice-to-have'),
          createItem('Zívání', 'creative')
        ]
      },
      {
        id: 'with-parents',
        name: 'S rodiči',
        color: 'bg-blue-500',
        items: [
          createItem('Maminka s miminkem', 'must-have'),
          createItem('Tatínek s miminkem', 'must-have'),
          createItem('Oba rodiče s miminkem', 'must-have'),
          createItem('Ruce rodičů s miminkem', 'creative')
        ]
      },
      {
        id: 'siblings',
        name: 'Sourozenci',
        color: 'bg-green-500',
        items: [
          createItem('Starší sourozenec s miminkem', 'nice-to-have'),
          createItem('Všichni sourozenci', 'nice-to-have')
        ]
      }
    ] as ShotCategory[]
  },
  {
    id: 'graduation',
    name: 'Promoce',
    description: 'Shot list pro promoci a tablaux',
    icon: GraduationCap,
    categories: [
      {
        id: 'formal',
        name: 'Formální',
        color: 'bg-blue-500',
        items: [
          createItem('V taláru - celá postava', 'must-have'),
          createItem('V taláru - portrét', 'must-have'),
          createItem('S diplomem', 'must-have'),
          createItem('Házení čepice', 'creative')
        ]
      },
      {
        id: 'family-grad',
        name: 'S rodinou',
        color: 'bg-green-500',
        items: [
          createItem('S rodiči', 'must-have'),
          createItem('S celou rodinou', 'nice-to-have'),
          createItem('S prarodiči', 'nice-to-have')
        ]
      },
      {
        id: 'friends',
        name: 'S přáteli',
        color: 'bg-purple-500',
        items: [
          createItem('Skupinové foto spolužáků', 'nice-to-have'),
          createItem('S nejlepším kamarádem', 'nice-to-have'),
          createItem('Veselé momenty', 'creative')
        ]
      }
    ] as ShotCategory[]
  }
]

export function ShotListTemplates({ onSelect, onClose }: ShotListTemplatesProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vyberte šablonu</h2>
            <p className="text-sm text-gray-600">
              Připravené shot listy pro různé typy focení
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => {
              const Icon = template.icon
              const totalShots = template.categories.reduce(
                (sum, cat) => sum + cat.items.length,
                0
              )
              const mustHaveCount = template.categories.reduce(
                (sum, cat) =>
                  sum + cat.items.filter(i => i.priority === 'must-have').length,
                0
              )

              return (
                <button
                  key={template.id}
                  onClick={() => onSelect(template.categories)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{template.categories.length} kategorií</span>
                        <span>{totalShots} záběrů</span>
                        <span className="text-amber-600">
                          {mustHaveCount} povinných
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Preview */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.categories.map(cat => (
                      <span
                        key={cat.id}
                        className={`${cat.color} text-white text-xs px-2 py-0.5 rounded`}
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
