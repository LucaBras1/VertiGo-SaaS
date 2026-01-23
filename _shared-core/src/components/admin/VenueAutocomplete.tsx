/**
 * Venue Autocomplete Component - Google Maps Places Autocomplete
 * Auto-fills venue name, address, postal code, city, and GPS coordinates
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface VenueAutocompleteProps {
  onPlaceSelected: (place: {
    name: string
    street: string
    city: string
    postalCode: string
    country: string
    lat: number
    lng: number
  }) => void
  placeholder?: string
  className?: string
}

export function VenueAutocomplete({ onPlaceSelected, placeholder = 'Začněte psát název místa nebo adresu...', className = '' }: VenueAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if API key is configured
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
      setError('Google Maps API klíč není nakonfigurován. Viz GOOGLE_MAPS_SETUP.md')
      return
    }

    // Load Google Maps script
    const loadGoogleMaps = async () => {
      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true)
        return
      }

      try {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=cs`
        script.async = true
        script.defer = true

        script.onload = () => {
          setIsLoaded(true)
        }

        script.onerror = () => {
          setError('Chyba při načítání Google Maps API')
        }

        document.head.appendChild(script)
      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError('Chyba při inicializaci Google Maps')
      }
    }

    loadGoogleMaps()
  }, [])

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return

    try {
      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: ['cz', 'sk'] }, // Limit to Czech Republic and Slovakia
        fields: ['address_components', 'geometry', 'name', 'formatted_address'],
        types: ['establishment', 'geocode'], // Allow both establishments and addresses
      })

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()

        if (!place || !place.geometry || !place.address_components) {
          return
        }

        // Extract address components
        let street = ''
        let city = ''
        let postalCode = ''
        let country = 'Česká republika'

        place.address_components.forEach((component) => {
          const types = component.types

          if (types.includes('route')) {
            street = component.long_name
          }
          if (types.includes('street_number')) {
            street = `${component.long_name} ${street}`.trim()
          }
          if (types.includes('locality')) {
            city = component.long_name
          }
          if (types.includes('postal_code')) {
            postalCode = component.long_name
          }
          if (types.includes('country')) {
            country = component.long_name
          }
        })

        // Get GPS coordinates
        const lat = place.geometry.location?.lat() || 0
        const lng = place.geometry.location?.lng() || 0

        // Get venue name (use place name or formatted address)
        const name = place.name || place.formatted_address || ''

        // Call the callback with extracted data
        onPlaceSelected({
          name,
          street,
          city,
          postalCode,
          country,
          lat,
          lng,
        })
      })
    } catch (err) {
      console.error('Error initializing autocomplete:', err)
      setError('Chyba při inicializaci vyhledávání')
    }

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onPlaceSelected])

  if (error) {
    return (
      <div className={className}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            disabled
            placeholder={error}
            className="block w-full pl-10 pr-3 py-2 border border-red-300 rounded-md leading-5 bg-red-50 text-red-900 placeholder-red-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
        </div>
        <p className="mt-1 text-xs text-red-600">{error}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={className}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400 animate-pulse" />
          </div>
          <input
            type="text"
            disabled
            placeholder="Načítání Google Maps..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Vyhledejte místo a automaticky se doplní adresa a GPS souřadnice
      </p>
    </div>
  )
}
