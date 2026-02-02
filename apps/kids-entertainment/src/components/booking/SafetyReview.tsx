/**
 * Safety Review Component
 * Step 4: AI safety check and allergy disclosure confirmation
 */

'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface SafetyReviewProps {
  packageId?: string
  activityIds: string[]
  childAge: number
  allergies?: string
  guestCount: number
  onConfirm: (safetyAcknowledged: boolean) => void
  onBack: () => void
}

interface SafetyCheckResult {
  overallRisk: 'low' | 'medium' | 'high'
  ageAppropriate: boolean
  allergenWarnings: string[]
  recommendations: string[]
  safetyNotes: string[]
}

export function SafetyReview({
  packageId,
  activityIds,
  childAge,
  allergies,
  guestCount,
  onConfirm,
  onBack,
}: SafetyReviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [safetyResult, setSafetyResult] = useState<SafetyCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    runSafetyCheck()
  }, [])

  async function runSafetyCheck() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/ai/safety-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          activityIds,
          childAge,
          allergies: allergies?.split(',').map(a => a.trim()).filter(Boolean) || [],
          guestCount,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to run safety check')
      }

      const result = await response.json()
      setSafetyResult(result)
    } catch (err) {
      setError('Nepodařilo se provést bezpečnostní kontrolu. Můžete pokračovat, ale doporučujeme nás kontaktovat.')
      // Fallback result
      setSafetyResult({
        overallRisk: 'medium',
        ageAppropriate: true,
        allergenWarnings: allergies ? ['Uváděné alergie budou zohledněny'] : [],
        recommendations: ['Kontaktujte nás pro potvrzení bezpečnostních opatření'],
        safetyNotes: [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-amber-600 bg-amber-100'
      case 'high':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'Nízké riziko'
      case 'medium':
        return 'Střední riziko'
      case 'high':
        return 'Vysoké riziko'
      default:
        return 'Neznámé'
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 text-partypal-pink-500 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Provádíme bezpečnostní kontrolu...
        </h3>
        <p className="text-gray-600">
          Kontrolujeme věkovou vhodnost a případná rizika
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 text-partypal-pink-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Bezpečnostní přehled</h2>
        <p className="text-gray-600 mt-2">
          Provedli jsme kontrolu programu pro bezpečnost vašich hostů
        </p>
      </div>

      {error && (
        <Card variant="outlined" className="p-4 border-amber-300 bg-amber-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        </Card>
      )}

      {safetyResult && (
        <>
          {/* Overall Risk Level */}
          <Card variant="outlined" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Celkové hodnocení
                </h3>
                <p className="text-sm text-gray-600">
                  Na základě vybraného programu a věku dítěte
                </p>
              </div>
              <Badge
                variant="default"
                className={getRiskColor(safetyResult.overallRisk)}
              >
                {getRiskLabel(safetyResult.overallRisk)}
              </Badge>
            </div>
          </Card>

          {/* Age Appropriateness */}
          <Card variant="outlined" className="p-6">
            <div className="flex items-start">
              {safetyResult.ageAppropriate ? (
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  Věková vhodnost
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {safetyResult.ageAppropriate
                    ? `Program je vhodný pro věk ${childAge} let`
                    : `Některé aktivity nemusí být ideální pro věk ${childAge} let. Náš tým program přizpůsobí.`}
                </p>
              </div>
            </div>
          </Card>

          {/* Allergen Warnings */}
          {safetyResult.allergenWarnings.length > 0 && (
            <Card variant="outlined" className="p-6 border-amber-300 bg-amber-50">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800">
                    Upozornění na alergeny
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {safetyResult.allergenWarnings.map((warning, index) => (
                      <li key={index} className="text-sm text-amber-700">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {safetyResult.recommendations.length > 0 && (
            <Card variant="outlined" className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Doporučení pro bezpečnost
              </h3>
              <ul className="space-y-2">
                {safetyResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Safety Notes */}
          {safetyResult.safetyNotes.length > 0 && (
            <Card variant="outlined" className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Bezpečnostní poznámky k programu
              </h3>
              <ul className="space-y-2">
                {safetyResult.safetyNotes.map((note, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {note}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Acknowledgment */}
          <Card variant="outlined" className="p-6 bg-gray-50">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 h-4 w-4 text-partypal-pink-500 focus:ring-partypal-pink-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                Potvrzuji, že jsem si přečetl/a bezpečnostní přehled a souhlasím s tím, že informace
                o alergiích a zdravotních omezeních jsou úplné a správné. Rozumím, že je mou odpovědností
                informovat o jakýchkoliv změnách před oslavou.
              </span>
            </label>
          </Card>
        </>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Zpět
        </Button>
        <Button
          size="lg"
          disabled={!acknowledged}
          onClick={() => onConfirm(acknowledged)}
        >
          Pokračovat k souhrnu
        </Button>
      </div>
    </div>
  )
}
