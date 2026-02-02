/**
 * Child Info Form Component
 * Step 3: Birthday child information and allergies
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Baby, Heart, AlertTriangle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const childInfoSchema = z.object({
  childName: z.string().min(2, 'Zadejte jméno dítěte'),
  childAge: z.number().min(1, 'Zadejte věk').max(18, 'Maximum je 18 let'),
  childGender: z.enum(['boy', 'girl', 'other', 'prefer_not_to_say']).optional(),
  childInterests: z.string().optional(),
  allergies: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  specialNeeds: z.string().optional(),
  emergencyContactName: z.string().min(2, 'Zadejte jméno kontaktní osoby'),
  emergencyContactPhone: z.string().min(9, 'Zadejte platné telefonní číslo'),
  emergencyContactRelation: z.string().min(2, 'Zadejte vztah k dítěti'),
  parentName: z.string().min(2, 'Zadejte jméno rodiče'),
  parentPhone: z.string().min(9, 'Zadejte platné telefonní číslo'),
  parentEmail: z.string().email('Zadejte platný email'),
})

export type ChildInfoData = z.infer<typeof childInfoSchema>

interface ChildInfoFormProps {
  defaultValues?: Partial<ChildInfoData>
  onSubmit: (data: ChildInfoData) => void
  onBack: () => void
}

const commonAllergens = [
  'Ořechy',
  'Mléko',
  'Lepek',
  'Vejce',
  'Sója',
  'Latex',
  'Barviva',
]

export function ChildInfoForm({
  defaultValues,
  onSubmit,
  onBack,
}: ChildInfoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChildInfoData>({
    resolver: zodResolver(childInfoSchema),
    defaultValues: {
      childGender: 'prefer_not_to_say',
      ...defaultValues,
    },
  })

  const allergies = watch('allergies') || ''

  const toggleAllergen = (allergen: string) => {
    const currentAllergies = allergies.split(',').map(a => a.trim()).filter(Boolean)
    const index = currentAllergies.indexOf(allergen)

    if (index === -1) {
      currentAllergies.push(allergen)
    } else {
      currentAllergies.splice(index, 1)
    }

    setValue('allergies', currentAllergies.join(', '))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card variant="outlined" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Baby className="h-5 w-5 mr-2 text-partypal-pink-500" />
          Informace o narozeninovém dítěti
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jméno dítěte *
            </label>
            <Input
              placeholder="Např. Adélka"
              {...register('childName')}
              error={errors.childName?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kolik bude mít let? *
            </label>
            <Input
              type="number"
              min={1}
              max={18}
              {...register('childAge', { valueAsNumber: true })}
              error={errors.childAge?.message}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pohlaví (volitelné)
            </label>
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'boy', label: 'Chlapec' },
                { value: 'girl', label: 'Dívka' },
                { value: 'other', label: 'Jiné' },
                { value: 'prefer_not_to_say', label: 'Nechci uvádět' },
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    value={option.value}
                    {...register('childGender')}
                    className="mr-2 text-partypal-pink-500 focus:ring-partypal-pink-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zájmy a koníčky (volitelné)
            </label>
            <Input
              placeholder="Např. princezny, dinosauři, fotbal, Frozen..."
              {...register('childInterests')}
            />
            <p className="text-xs text-gray-500 mt-1">
              Pomohou nám přizpůsobit program
            </p>
          </div>
        </div>
      </Card>

      <Card variant="outlined" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
          Alergie a zdravotní omezení
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Tyto informace jsou velmi důležité pro bezpečnost dětí. Uveďte prosím všechny známé alergie.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rychlý výběr běžných alergenů:
          </label>
          <div className="flex flex-wrap gap-2">
            {commonAllergens.map((allergen) => {
              const isSelected = allergies.includes(allergen)
              return (
                <Badge
                  key={allergen}
                  variant={isSelected ? 'danger' : 'default'}
                  className="cursor-pointer"
                  onClick={() => toggleAllergen(allergen)}
                >
                  {allergen}
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alergie (volitelné)
            </label>
            <Input
              placeholder="Např. ořechy, lepek, mléko..."
              {...register('allergies')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dietetická omezení (volitelné)
            </label>
            <Input
              placeholder="Např. vegetarián, vegan, bezlepková dieta..."
              {...register('dietaryRestrictions')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speciální potřeby (volitelné)
            </label>
            <textarea
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-partypal-pink-500 focus:ring-partypal-pink-500"
              rows={2}
              placeholder="Jakékoliv další informace, které bychom měli vědět..."
              {...register('specialNeeds')}
            />
          </div>
        </div>
      </Card>

      <Card variant="outlined" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Phone className="h-5 w-5 mr-2 text-partypal-pink-500" />
          Kontaktní údaje
        </h3>
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Rodič / Objednavatel</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jméno *
              </label>
              <Input
                {...register('parentName')}
                error={errors.parentName?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon *
              </label>
              <Input
                type="tel"
                {...register('parentPhone')}
                error={errors.parentPhone?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                {...register('parentEmail')}
                error={errors.parentEmail?.message}
              />
            </div>
          </div>

          <hr className="my-4" />

          <h4 className="font-medium text-gray-800">Nouzový kontakt</h4>
          <p className="text-sm text-gray-500 mb-2">
            Osoba, kterou můžeme kontaktovat v případě nouze během oslavy
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jméno *
              </label>
              <Input
                {...register('emergencyContactName')}
                error={errors.emergencyContactName?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon *
              </label>
              <Input
                type="tel"
                {...register('emergencyContactPhone')}
                error={errors.emergencyContactPhone?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vztah k dítěti *
              </label>
              <Input
                placeholder="Např. babička, strýc..."
                {...register('emergencyContactRelation')}
                error={errors.emergencyContactRelation?.message}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Zpět
        </Button>
        <Button type="submit" size="lg">
          Pokračovat
        </Button>
      </div>
    </form>
  )
}
