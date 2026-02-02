/**
 * Booking Wizard Client Component
 * Manages state and navigation between booking steps
 */

'use client'

import { useState, useCallback } from 'react'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { PackageSelector } from '@/components/booking/PackageSelector'
import { PartyDetailsForm, PartyDetailsData } from '@/components/booking/PartyDetailsForm'
import { ChildInfoForm, ChildInfoData } from '@/components/booking/ChildInfoForm'
import { SafetyReview } from '@/components/booking/SafetyReview'
import { BookingSummary } from '@/components/booking/BookingSummary'

interface Package {
  id: string
  title: string
  subtitle?: string | null
  excerpt?: string | null
  price?: number | null
  duration: number
  ageGroups: string[]
  maxChildren?: number | null
  themeName?: string | null
  includesCharacter: boolean
  includesCake: boolean
  includesGoodybags: boolean
  featured: boolean
}

interface Activity {
  id: string
  title: string
  duration: number
  price?: number | null
  safetyRating: string
  energyLevel?: string | null
}

interface BookingWizardProps {
  packages: Package[]
  activities: Activity[]
}

const steps = [
  { id: 1, name: 'Program' },
  { id: 2, name: 'Termín' },
  { id: 3, name: 'Dítě' },
  { id: 4, name: 'Bezpečnost' },
  { id: 5, name: 'Souhrn' },
]

export function BookingWizard({ packages, activities }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>()
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([])
  const [partyDetails, setPartyDetails] = useState<PartyDetailsData | null>(null)
  const [childInfo, setChildInfo] = useState<ChildInfoData | null>(null)
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false)

  // Step 1: Package/Activity Selection
  const handleSelectPackage = useCallback((packageId: string | undefined) => {
    setSelectedPackageId(packageId)
    if (packageId) {
      setSelectedActivityIds([])
    }
  }, [])

  const handleToggleActivity = useCallback((activityId: string) => {
    if (!activityId) {
      setSelectedActivityIds([])
      return
    }
    setSelectedActivityIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    )
    setSelectedPackageId(undefined)
  }, [])

  // Step 2: Party Details
  const handlePartyDetailsSubmit = useCallback((data: PartyDetailsData) => {
    setPartyDetails(data)
    setCurrentStep(3)
  }, [])

  // Step 3: Child Info
  const handleChildInfoSubmit = useCallback((data: ChildInfoData) => {
    setChildInfo(data)
    setCurrentStep(4)
  }, [])

  // Step 4: Safety Review
  const handleSafetyConfirm = useCallback((acknowledged: boolean) => {
    setSafetyAcknowledged(acknowledged)
    setCurrentStep(5)
  }, [])

  // Step 5: Submit Booking
  const handleSubmitBooking = useCallback(async () => {
    if (!partyDetails || !childInfo) {
      throw new Error('Missing required data')
    }

    const bookingData = {
      packageId: selectedPackageId,
      activityIds: selectedActivityIds,
      partyDetails: {
        date: partyDetails.date,
        startTime: partyDetails.startTime,
        venue: {
          name: partyDetails.venueName,
          address: partyDetails.venueAddress,
          city: partyDetails.venueCity,
          type: partyDetails.venueType,
        },
        guestCount: partyDetails.guestCount,
        specialRequests: partyDetails.specialRequests,
      },
      childInfo: {
        name: childInfo.childName,
        age: childInfo.childAge,
        gender: childInfo.childGender,
        interests: childInfo.childInterests,
        allergies: childInfo.allergies?.split(',').map((a) => a.trim()).filter(Boolean),
        dietaryRestrictions: childInfo.dietaryRestrictions?.split(',').map((a) => a.trim()).filter(Boolean),
        specialNeeds: childInfo.specialNeeds,
      },
      contact: {
        parentName: childInfo.parentName,
        parentPhone: childInfo.parentPhone,
        parentEmail: childInfo.parentEmail,
        emergencyContact: {
          name: childInfo.emergencyContactName,
          phone: childInfo.emergencyContactPhone,
          relation: childInfo.emergencyContactRelation,
        },
      },
      safetyAcknowledged,
    }

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })

    if (!response.ok) {
      throw new Error('Failed to submit booking')
    }
  }, [selectedPackageId, selectedActivityIds, partyDetails, childInfo, safetyAcknowledged])

  // Get selected package and activities data for summary
  const selectedPackage = packages.find((p) => p.id === selectedPackageId)
  const selectedActivitiesData = activities.filter((a) => selectedActivityIds.includes(a.id))

  return (
    <div>
      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="mt-12">
        {currentStep === 1 && (
          <PackageSelector
            packages={packages.map((p) => ({
              ...p,
              subtitle: p.subtitle || undefined,
              excerpt: p.excerpt || undefined,
              price: p.price || undefined,
              maxChildren: p.maxChildren || undefined,
              themeName: p.themeName || undefined,
            }))}
            activities={activities.map((a) => ({
              ...a,
              price: a.price || undefined,
              energyLevel: a.energyLevel || undefined,
            }))}
            selectedPackageId={selectedPackageId}
            selectedActivityIds={selectedActivityIds}
            onSelectPackage={handleSelectPackage}
            onToggleActivity={handleToggleActivity}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <PartyDetailsForm
            defaultValues={partyDetails || undefined}
            onSubmit={handlePartyDetailsSubmit}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <ChildInfoForm
            defaultValues={childInfo || undefined}
            onSubmit={handleChildInfoSubmit}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && childInfo && partyDetails && (
          <SafetyReview
            packageId={selectedPackageId}
            activityIds={selectedActivityIds}
            childAge={childInfo.childAge}
            allergies={childInfo.allergies}
            guestCount={partyDetails.guestCount}
            onConfirm={handleSafetyConfirm}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && partyDetails && childInfo && (
          <BookingSummary
            packageData={
              selectedPackage
                ? {
                    id: selectedPackage.id,
                    title: selectedPackage.title,
                    price: selectedPackage.price || undefined,
                    duration: selectedPackage.duration,
                  }
                : undefined
            }
            selectedActivities={selectedActivitiesData.map((a) => ({
              id: a.id,
              title: a.title,
              price: a.price || undefined,
              duration: a.duration,
            }))}
            partyDetails={partyDetails}
            childInfo={{
              childName: childInfo.childName,
              childAge: childInfo.childAge,
              childGender: childInfo.childGender,
              allergies: childInfo.allergies,
              parentName: childInfo.parentName,
              parentPhone: childInfo.parentPhone,
              parentEmail: childInfo.parentEmail,
            }}
            onSubmit={handleSubmitBooking}
            onBack={() => setCurrentStep(4)}
          />
        )}
      </div>
    </div>
  )
}
