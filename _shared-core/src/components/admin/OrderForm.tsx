'use client'

/**
 * Order Form Component
 *
 * Comprehensive form for creating and editing orders
 * Includes customer selection, items, venue, pricing, and technical requirements
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, MapPin, Calculator, Users, UserPlus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { CreateCustomerModal } from './modals/CreateCustomerModal'
import { VenueAutocomplete } from './VenueAutocomplete'
import { CustomerSearch } from './CustomerSearch'
import { CustomerOrderHistory } from './CustomerOrderHistory'

interface OrderFormProps {
  order?: any
}

export function OrderForm({ order }: OrderFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)

  // Loading states for options
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [customers, setCustomers] = useState<any[]>([])
  const [performances, setPerformances] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  // Customer Section
  const [customerId, setCustomerId] = useState(order?.customerId || '')
  const [source, setSource] = useState(order?.source || 'manual')

  // Event Details
  const [eventName, setEventName] = useState(order?.eventName || '')
  const [dates, setDates] = useState<string[]>(
    order?.dates ? (typeof order.dates === 'string' ? JSON.parse(order.dates) : order.dates) : ['']
  )
  const [arrivalTime, setArrivalTime] = useState(order?.arrivalTime || '')
  const [preparationTime, setPreparationTime] = useState(order?.preparationTime || 60)
  const [eventDuration, setEventDuration] = useState(order?.eventDuration || '')

  // Venue
  const [venueName, setVenueName] = useState(order?.venue?.name || '')
  const [venueStreet, setVenueStreet] = useState(order?.venue?.street || '')
  const [venueCity, setVenueCity] = useState(order?.venue?.city || '')
  const [venuePostalCode, setVenuePostalCode] = useState(order?.venue?.postalCode || '')
  const [venueGpsLat, setVenueGpsLat] = useState(order?.venue?.gpsCoordinates?.lat || '')
  const [venueGpsLng, setVenueGpsLng] = useState(order?.venue?.gpsCoordinates?.lng || '')

  // Order Items
  const [items, setItems] = useState<any[]>(order?.items || [])

  // Technical Requirements
  const [parking, setParking] = useState(order?.technicalRequirements?.parking || false)
  const [parkingSpaces, setParkingSpaces] = useState(order?.technicalRequirements?.parkingSpaces || 1)
  const [electricity, setElectricity] = useState(order?.technicalRequirements?.electricity || false)
  const [electricityVoltage, setElectricityVoltage] = useState(order?.technicalRequirements?.electricityVoltage || '230V')
  const [accommodation, setAccommodation] = useState(order?.technicalRequirements?.accommodation || false)
  const [accommodationPersons, setAccommodationPersons] = useState(order?.technicalRequirements?.accommodationPersons || 2)
  const [sound, setSound] = useState(order?.technicalRequirements?.sound || false)
  const [lighting, setLighting] = useState(order?.technicalRequirements?.lighting || false)
  const [otherRequirements, setOtherRequirements] = useState(order?.technicalRequirements?.otherRequirements || '')

  // Pricing
  const [pricingItems, setPricingItems] = useState<any[]>(
    order?.pricing?.items || []
  )
  const [subtotal, setSubtotal] = useState(order?.pricing?.subtotal || 0)
  const [travelCosts, setTravelCosts] = useState(order?.pricing?.travelCosts || 0)
  const [discount, setDiscount] = useState(order?.pricing?.discount || 0)
  const [totalPrice, setTotalPrice] = useState(order?.pricing?.totalPrice || 0)
  const [vatIncluded, setVatIncluded] = useState(order?.pricing?.vatIncluded !== undefined ? order.pricing.vatIncluded : true)
  const [pricingNotes, setPricingNotes] = useState(order?.pricing?.notes || '')

  // Payment & Invoicing
  const [paymentMethod, setPaymentMethod] = useState(order?.paymentMethod || '')
  const [paymentDueDate, setPaymentDueDate] = useState(order?.paymentDueDate ? order.paymentDueDate.split('T')[0] : '')
  const [invoiceEmail, setInvoiceEmail] = useState(order?.invoiceEmail || '')

  // Logistics (internal)
  const [logisticsDepartureTime, setLogisticsDepartureTime] = useState(order?.logistics?.departureTime || '')
  const [logisticsReturnTime, setLogisticsReturnTime] = useState(order?.logistics?.returnTime || '')
  const [logisticsTravelDuration, setLogisticsTravelDuration] = useState(order?.logistics?.travelDuration || '')
  const [logisticsTotalKilometers, setLogisticsTotalKilometers] = useState(order?.logistics?.totalKilometers || '')
  const [logisticsTransportType, setLogisticsTransportType] = useState(order?.logistics?.transportType || '')
  const [logisticsTransportNotes, setLogisticsTransportNotes] = useState(order?.logistics?.transportNotes || '')

  // Contacts
  const [primaryContactName, setPrimaryContactName] = useState(order?.contacts?.primary?.name || '')
  const [primaryContactPhone, setPrimaryContactPhone] = useState(order?.contacts?.primary?.phone || '')
  const [primaryContactEmail, setPrimaryContactEmail] = useState(order?.contacts?.primary?.email || '')
  const [primaryContactIco, setPrimaryContactIco] = useState(order?.contacts?.primary?.ico || '')
  const [primaryContactCompanyName, setPrimaryContactCompanyName] = useState(order?.contacts?.primary?.companyName || '')
  const [onSiteContactName, setOnSiteContactName] = useState(order?.contacts?.onSite?.name || '')
  const [onSiteContactPhone, setOnSiteContactPhone] = useState(order?.contacts?.onSite?.phone || '')
  const [divadloOnSiteName, setDivadloOnSiteName] = useState(order?.contacts?.divadloOnSite?.name || '')
  const [divadloOnSitePhone, setDivadloOnSitePhone] = useState(order?.contacts?.divadloOnSite?.phone || '')

  // Documents
  const [customerOrderNumber, setCustomerOrderNumber] = useState(order?.documents?.customerOrderNumber || '')
  const [contractNumber, setContractNumber] = useState(order?.documents?.contractNumber || '')

  // Communication
  const [contactMessage, setContactMessage] = useState(order?.contactMessage || '')
  const [internalNotes, setInternalNotes] = useState(order?.internalNotes || '')

  // Fetch all options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [customersRes, performancesRes, gamesRes, servicesRes] = await Promise.all([
          fetch('/api/admin/customers?pageSize=1000'),
          fetch('/api/admin/performances?pageSize=1000'),
          fetch('/api/admin/games?pageSize=1000'),
          fetch('/api/admin/services?pageSize=1000'),
        ])

        const [customersData, performancesData, gamesData, servicesData] = await Promise.all([
          customersRes.json(),
          performancesRes.json(),
          gamesRes.json(),
          servicesRes.json(),
        ])

        setCustomers(customersData.customers || customersData.data || [])
        setPerformances(performancesData.performances || performancesData.data || [])
        setGames(gamesData.games || gamesData.data || [])
        setServices(servicesData.services || servicesData.data || [])
      } catch (err) {
        console.error('Error fetching options:', err)
        setError('Chyba při načítání dat. Obnovte stránku.')
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // Auto-calculate pricing totals from order items
  useEffect(() => {
    // Sum prices from order items
    const orderItemsTotal = items.reduce((sum, item) => sum + (item.price || 0), 0)
    // Sum prices from manual pricing items
    const manualItemsTotal = pricingItems.reduce((sum, item) => sum + (item.amount || 0), 0)

    const calculatedSubtotal = orderItemsTotal + manualItemsTotal
    const calculatedTotal = calculatedSubtotal + travelCosts - discount

    setSubtotal(calculatedSubtotal)
    setTotalPrice(calculatedTotal)
  }, [items, pricingItems, travelCosts, discount])

  const addDate = () => {
    setDates([...dates, ''])
  }

  // Handle new customer created from modal
  const handleCustomerCreated = async (newCustomer: { _id: string; firstName: string; lastName: string; organization?: string }) => {
    // Refresh customers list
    try {
      const response = await fetch('/api/admin/customers?pageSize=1000')
      const data = await response.json()
      setCustomers(data.customers || data.data || [])

      // Auto-select the newly created customer
      setCustomerId(newCustomer._id)
    } catch (err) {
      console.error('Error refreshing customers:', err)
    }
  }

  // Refresh all dropdowns (customers, performances, games, services)
  const refreshAllOptions = async () => {
    try {
      const [customersRes, performancesRes, gamesRes, servicesRes] = await Promise.all([
        fetch('/api/admin/customers?pageSize=1000'),
        fetch('/api/admin/performances?pageSize=1000'),
        fetch('/api/admin/games?pageSize=1000'),
        fetch('/api/admin/services?pageSize=1000'),
      ])

      const [customersData, performancesData, gamesData, servicesData] = await Promise.all([
        customersRes.json(),
        performancesRes.json(),
        gamesRes.json(),
        servicesRes.json(),
      ])

      setCustomers(customersData.customers || customersData.data || [])
      setPerformances(performancesData.performances || performancesData.data || [])
      setGames(gamesData.games || gamesData.data || [])
      setServices(servicesData.services || servicesData.data || [])
    } catch (err) {
      console.error('Error refreshing options:', err)
    }
  }

  // Handle venue selection from Google Maps autocomplete
  const handleVenueSelected = (place: {
    name: string
    street: string
    city: string
    postalCode: string
    country: string
    lat: number
    lng: number
  }) => {
    setVenueName(place.name)
    setVenueStreet(place.street)
    setVenueCity(place.city)
    setVenuePostalCode(place.postalCode)
    setVenueGpsLat(place.lat.toString())
    setVenueGpsLng(place.lng.toString())
  }

  const updateDate = (index: number, value: string) => {
    const newDates = [...dates]
    newDates[index] = value
    setDates(newDates)
  }

  const removeDate = (index: number) => {
    setDates(dates.filter((_, i) => i !== index))
  }

  const addOrderItem = () => {
    setItems([
      ...items,
      {
        type: 'performance',
        performanceId: '',
        gameId: '',
        serviceId: '',
        date: '',
        startTime: '',
        endTime: '',
        price: 0,
        notes: '',
      },
    ])
  }

  const updateOrderItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-load price when selecting a performance, game, or service
    if (field === 'performanceId' && value) {
      const perf = performances.find(p => p.id === value)
      if (perf?.price) {
        newItems[index].price = perf.price
      }
    }
    if (field === 'gameId' && value) {
      const game = games.find(g => g.id === value)
      if (game?.price) {
        newItems[index].price = game.price
      }
    }
    if (field === 'serviceId' && value) {
      const service = services.find(s => s.id === value)
      if (service?.priceFrom) {
        newItems[index].price = service.priceFrom
      }
    }

    setItems(newItems)
  }

  const removeOrderItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const addPricingItem = () => {
    setPricingItems([
      ...pricingItems,
      { description: '', amount: 0 },
    ])
  }

  const updatePricingItem = (index: number, field: string, value: any) => {
    const newItems = [...pricingItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setPricingItems(newItems)
  }

  const removePricingItem = (index: number) => {
    setPricingItems(pricingItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validation
      if (!customerId) {
        throw new Error('Vyberte zákazníka')
      }
      if (dates.filter(d => d).length === 0) {
        throw new Error('Zadejte alespoň jedno datum')
      }
      if (!venueName) {
        throw new Error('Zadejte název místa konání')
      }

      // Build venue object
      const venue: any = {
        name: venueName,
        street: venueStreet,
        city: venueCity,
        postalCode: venuePostalCode,
      }
      if (venueGpsLat && venueGpsLng) {
        venue.gpsCoordinates = {
          lat: parseFloat(venueGpsLat),
          lng: parseFloat(venueGpsLng),
        }
      }

      // Build technical requirements
      const technicalRequirements = {
        parking,
        parkingSpaces: parking ? parkingSpaces : undefined,
        electricity,
        electricityVoltage: electricity ? electricityVoltage : undefined,
        accommodation,
        accommodationPersons: accommodation ? accommodationPersons : undefined,
        sound,
        lighting,
        otherRequirements: otherRequirements || undefined,
      }

      // Build pricing object
      const pricing = {
        items: pricingItems.filter(item => item.description),
        subtotal,
        travelCosts,
        discount,
        totalPrice,
        vatIncluded,
        notes: pricingNotes || undefined,
      }

      // Build contacts object
      const contacts = {
        primary: {
          name: primaryContactName || undefined,
          phone: primaryContactPhone || undefined,
          email: primaryContactEmail || undefined,
          ico: primaryContactIco || undefined,
          companyName: primaryContactCompanyName || undefined,
        },
        onSite: {
          name: onSiteContactName || undefined,
          phone: onSiteContactPhone || undefined,
        },
        divadloOnSite: {
          name: divadloOnSiteName || undefined,
          phone: divadloOnSitePhone || undefined,
        },
      }

      // Build documents object
      const documents = {
        customerOrderNumber: customerOrderNumber || undefined,
        contractNumber: contractNumber || undefined,
      }

      // Build logistics object (internal)
      const logistics = (logisticsDepartureTime || logisticsReturnTime || logisticsTravelDuration || logisticsTotalKilometers || logisticsTransportType || logisticsTransportNotes) ? {
        departureTime: logisticsDepartureTime || undefined,
        returnTime: logisticsReturnTime || undefined,
        travelDuration: logisticsTravelDuration ? parseInt(logisticsTravelDuration) : undefined,
        totalKilometers: logisticsTotalKilometers ? parseInt(logisticsTotalKilometers) : undefined,
        transportType: logisticsTransportType || undefined,
        transportNotes: logisticsTransportNotes || undefined,
      } : undefined

      const data = {
        customerId,
        source,
        eventName: eventName || undefined,
        dates: dates.filter(d => d),
        venue,
        arrivalTime: arrivalTime || undefined,
        preparationTime: preparationTime || undefined,
        eventDuration: eventDuration ? parseInt(eventDuration.toString()) : undefined,
        // Payment & Invoicing
        paymentMethod: paymentMethod || undefined,
        paymentDueDate: paymentDueDate || undefined,
        invoiceEmail: invoiceEmail || undefined,
        // Logistics
        logistics,
        items: items.map(item => ({
          type: item.type,
          performanceId: item.type === 'performance' ? item.performanceId : undefined,
          gameId: item.type === 'game' ? item.gameId : undefined,
          serviceId: item.type === 'service' ? item.serviceId : undefined,
          date: item.date,
          startTime: item.startTime || undefined,
          endTime: item.endTime || undefined,
          price: item.price || 0,
          notes: item.notes || undefined,
        })),
        technicalRequirements,
        pricing,
        contacts,
        documents,
        contactMessage: contactMessage || undefined,
        internalNotes: internalNotes || undefined,
      }

      const url = order ? `/api/admin/orders/${order.id}` : '/api/admin/orders'
      const method = order ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Chyba při ukládání objednávky')
      }

      // Show toast notification based on result
      if (!order) {
        // New order - show email status
        if (result.offerSent) {
          toast.success('Objednávka vytvořena a nabídka odeslána zákazníkovi', {
            duration: 5000,
          })
        } else if (result.offerError) {
          toast.error(
            `Objednávka vytvořena, ale email se nepodařilo odeslat: ${result.offerError}`,
            { duration: 8000 }
          )
        } else {
          toast.success('Objednávka vytvořena')
        }
      } else {
        toast.success('Změny uloženy')
      }

      router.push('/admin/orders')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při ukládání objednávky'
      setError(errorMessage)
      toast.error(errorMessage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Načítání formuláře...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="font-medium">Chyba při ukládání</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Customer Selection */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Zákazník
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Vyberte existujícího zákazníka nebo vytvořte nového
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                  Zákazník *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Nový zákazník
                </button>
              </div>
              <CustomerSearch
                customers={customers}
                selectedId={customerId}
                onSelect={setCustomerId}
                placeholder="Hledat dle jména, organizace, IČO, emailu, telefonu..."
              />

              {/* Customer Order History */}
              {customerId && (
                <CustomerOrderHistory customerId={customerId} collapsed={true} />
              )}
            </div>

            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Zdroj objednávky
              </label>
              <select
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="manual">Manuální zadání</option>
                <option value="contact_form">Kontaktní formulář</option>
                <option value="phone">Telefon</option>
                <option value="email">Email</option>
                <option value="repeat">Opakovaná objednávka</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Detaily akce
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Základní informace o události
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">
                Název akce
              </label>
              <input
                type="text"
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="např. Den otevřených dveří"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Termíny *
              </label>
              {dates.map((date, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => updateDate(index, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                  />
                  {dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDate(index)}
                      className="px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDate}
                className="mt-2 inline-flex items-center gap-2 px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Přidat další termín
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="arrivalTime" className="block text-sm font-medium text-gray-700">
                  Čas příjezdu
                </label>
                <input
                  type="time"
                  id="arrivalTime"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700">
                  Čas na přípravu (min)
                </label>
                <input
                  type="number"
                  id="preparationTime"
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="eventDuration" className="block text-sm font-medium text-gray-700">
                  Délka akce (min)
                </label>
                <select
                  id="eventDuration"
                  value={eventDuration}
                  onChange={(e) => setEventDuration(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="">Nevybráno</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hodina</option>
                  <option value="90">1,5 hodiny</option>
                  <option value="120">2 hodiny</option>
                  <option value="150">2,5 hodiny</option>
                  <option value="180">3 hodiny</option>
                  <option value="240">4 hodiny</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Venue */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Místo konání
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Adresa a GPS souřadnice místa konání
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            {/* Google Maps Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyhledat místo (Google Maps)
              </label>
              <VenueAutocomplete onPlaceSelected={handleVenueSelected} />
            </div>

            {/* Manual fields (can be edited after autocomplete) */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                Nebo vyplňte údaje ručně:
              </p>
            </div>

            <div>
              <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">
                Název místa *
              </label>
              <input
                type="text"
                id="venueName"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="např. Základní škola Jiřího z Poděbrad"
                required
              />
            </div>

            <div>
              <label htmlFor="venueStreet" className="block text-sm font-medium text-gray-700">
                Ulice a číslo
              </label>
              <input
                type="text"
                id="venueStreet"
                value={venueStreet}
                onChange={(e) => setVenueStreet(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="např. Náměstí 123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="venueCity" className="block text-sm font-medium text-gray-700">
                  Město
                </label>
                <input
                  type="text"
                  id="venueCity"
                  value={venueCity}
                  onChange={(e) => setVenueCity(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="např. Praha"
                />
              </div>

              <div>
                <label htmlFor="venuePostalCode" className="block text-sm font-medium text-gray-700">
                  PSČ
                </label>
                <input
                  type="text"
                  id="venuePostalCode"
                  value={venuePostalCode}
                  onChange={(e) => setVenuePostalCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="110 00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="venueGpsLat" className="block text-sm font-medium text-gray-700">
                  GPS Šířka
                </label>
                <input
                  type="text"
                  id="venueGpsLat"
                  value={venueGpsLat}
                  onChange={(e) => setVenueGpsLat(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="50.0755"
                />
              </div>

              <div>
                <label htmlFor="venueGpsLng" className="block text-sm font-medium text-gray-700">
                  GPS Délka
                </label>
                <input
                  type="text"
                  id="venueGpsLng"
                  value={venueGpsLng}
                  onChange={(e) => setVenueGpsLng(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="14.4378"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Položky objednávky
              </h3>
              <button
                type="button"
                onClick={refreshAllOptions}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                title="Obnovit seznam inscenací, her a služeb"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Obnovit
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Inscenace, hry nebo služby
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Typ položky
                      </label>
                      <select
                        value={item.type}
                        onChange={(e) => updateOrderItem(index, 'type', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      >
                        <option value="performance">Inscenace</option>
                        <option value="game">Hra</option>
                        <option value="service">Služba</option>
                      </select>
                    </div>

                    {item.type === 'performance' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Inscenace
                        </label>
                        <select
                          value={item.performanceId}
                          onChange={(e) => updateOrderItem(index, 'performanceId', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Vyberte inscenaci...</option>
                          {performances.map((perf) => (
                            <option key={perf.id} value={perf.id}>
                              {perf.title}{perf.price ? ` (${perf.price.toLocaleString('cs-CZ')} Kč)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {item.type === 'game' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hra
                        </label>
                        <select
                          value={item.gameId}
                          onChange={(e) => updateOrderItem(index, 'gameId', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Vyberte hru...</option>
                          {games.map((game) => (
                            <option key={game.id} value={game.id}>
                              {game.title}{game.price ? ` (${game.price.toLocaleString('cs-CZ')} Kč)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {item.type === 'service' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Služba
                        </label>
                        <select
                          value={item.serviceId}
                          onChange={(e) => updateOrderItem(index, 'serviceId', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Vyberte službu...</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.title}{service.priceFrom ? ` (od ${service.priceFrom.toLocaleString('cs-CZ')} Kč)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Datum
                        </label>
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateOrderItem(index, 'date', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Začátek
                        </label>
                        <input
                          type="time"
                          value={item.startTime}
                          onChange={(e) => updateOrderItem(index, 'startTime', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Konec
                        </label>
                        <input
                          type="time"
                          value={item.endTime}
                          onChange={(e) => updateOrderItem(index, 'endTime', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cena (Kč)
                        </label>
                        <input
                          type="number"
                          value={item.price || 0}
                          onChange={(e) => updateOrderItem(index, 'price', parseInt(e.target.value) || 0)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Poznámky
                      </label>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateOrderItem(index, 'notes', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        placeholder="Speciální požadavky..."
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeOrderItem(index)}
                    className="ml-3 px-2 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addOrderItem}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Přidat položku
            </button>
          </div>
        </div>
      </div>

      {/* Technical Requirements */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Technické požadavky
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Parkování, elektrika, ubytování, atd.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="parking"
                    checked={parking}
                    onChange={(e) => setParking(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <label htmlFor="parking" className="font-medium text-gray-700 text-sm">
                    Parkování
                  </label>
                  {parking && (
                    <div className="mt-2">
                      <input
                        type="number"
                        value={parkingSpaces}
                        onChange={(e) => setParkingSpaces(parseInt(e.target.value) || 1)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        placeholder="Počet míst"
                        min="1"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="electricity"
                    checked={electricity}
                    onChange={(e) => setElectricity(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <label htmlFor="electricity" className="font-medium text-gray-700 text-sm">
                    Elektřina
                  </label>
                  {electricity && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={electricityVoltage}
                        onChange={(e) => setElectricityVoltage(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        placeholder="např. 230V"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="accommodation"
                    checked={accommodation}
                    onChange={(e) => setAccommodation(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <label htmlFor="accommodation" className="font-medium text-gray-700 text-sm">
                    Ubytování
                  </label>
                  {accommodation && (
                    <div className="mt-2">
                      <input
                        type="number"
                        value={accommodationPersons}
                        onChange={(e) => setAccommodationPersons(parseInt(e.target.value) || 2)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        placeholder="Počet osob"
                        min="1"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="sound"
                    checked={sound}
                    onChange={(e) => setSound(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="sound" className="font-medium text-gray-700 text-sm">
                    Ozvučení
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="lighting"
                    checked={lighting}
                    onChange={(e) => setLighting(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="lighting" className="font-medium text-gray-700 text-sm">
                    Osvětlení
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="otherRequirements" className="block text-sm font-medium text-gray-700">
                Další požadavky
              </label>
              <textarea
                id="otherRequirements"
                value={otherRequirements}
                onChange={(e) => setOtherRequirements(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Další technické požadavky..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cena
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Kalkulace ceny a cestovních nákladů
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            {pricingItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updatePricingItem(index, 'description', e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="Popis položky"
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => updatePricingItem(index, 'amount', parseInt(e.target.value) || 0)}
                  className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="Částka"
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => removePricingItem(index)}
                  className="px-2 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addPricingItem}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Přidat položku
            </button>

            <div className="border-t pt-4 space-y-3">
              {/* Show order items sum */}
              {items.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Položky objednávky ({items.length}×):</span>
                  <span className="text-gray-900">{items.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString('cs-CZ')} Kč</span>
                </div>
              )}
              {/* Show manual pricing items sum */}
              {pricingItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Další položky ({pricingItems.length}×):</span>
                  <span className="text-gray-900">{pricingItems.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString('cs-CZ')} Kč</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Mezisoučet:</span>
                <span className="text-gray-900">{subtotal.toLocaleString('cs-CZ')} Kč</span>
              </div>

              <div>
                <label htmlFor="travelCosts" className="block text-sm font-medium text-gray-700 mb-1">
                  Cestovní náklady
                </label>
                <input
                  type="number"
                  id="travelCosts"
                  value={travelCosts}
                  onChange={(e) => setTravelCosts(parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                  Sleva
                </label>
                <input
                  type="number"
                  id="discount"
                  value={discount}
                  onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  min="0"
                />
              </div>

              <div className="flex justify-between text-lg border-t pt-3">
                <span className="font-bold text-gray-900">Celkem:</span>
                <span className="font-bold text-gray-900">{totalPrice.toLocaleString('cs-CZ')} Kč</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vatIncluded"
                  checked={vatIncluded}
                  onChange={(e) => setVatIncluded(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="vatIncluded" className="ml-2 text-sm text-gray-700">
                  Cena včetně DPH
                </label>
              </div>

              <div>
                <label htmlFor="pricingNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Poznámky k ceně
                </label>
                <textarea
                  id="pricingNotes"
                  value={pricingNotes}
                  onChange={(e) => setPricingNotes(e.target.value)}
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="Speciální podmínky, platební údaje..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Invoicing */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Fakturace a platba
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Způsob platby a údaje pro fakturaci
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                  Způsob platby
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="">Nevybráno</option>
                  <option value="deposit">Záloha</option>
                  <option value="invoice">Faktura se splatností</option>
                  <option value="cash">Hotovost na místě</option>
                  <option value="prepaid">Platba předem</option>
                </select>
              </div>
              {paymentMethod === 'invoice' && (
                <div>
                  <label htmlFor="paymentDueDate" className="block text-sm font-medium text-gray-700">
                    Datum splatnosti
                  </label>
                  <input
                    type="date"
                    id="paymentDueDate"
                    value={paymentDueDate}
                    onChange={(e) => setPaymentDueDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="invoiceEmail" className="block text-sm font-medium text-gray-700">
                Email pro fakturu
              </label>
              <input
                type="email"
                id="invoiceEmail"
                value={invoiceEmail}
                onChange={(e) => setInvoiceEmail(e.target.value)}
                placeholder="fakturace@firma.cz"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Kam má být zaslána faktura (pokud je jiný než kontaktní email)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logistics (Internal) */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Logistika dopravy
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Interní poznámky k dopravě na akci
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="logisticsTransportType" className="block text-sm font-medium text-gray-700">
                  Typ dopravy
                </label>
                <select
                  id="logisticsTransportType"
                  value={logisticsTransportType}
                  onChange={(e) => setLogisticsTransportType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="">Nevybráno</option>
                  <option value="car">Auto</option>
                  <option value="van">Dodávka</option>
                  <option value="train">Vlak</option>
                  <option value="other">Jiné</option>
                </select>
              </div>
              <div>
                <label htmlFor="logisticsDepartureTime" className="block text-sm font-medium text-gray-700">
                  Čas odjezdu
                </label>
                <input
                  type="time"
                  id="logisticsDepartureTime"
                  value={logisticsDepartureTime}
                  onChange={(e) => setLogisticsDepartureTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="logisticsReturnTime" className="block text-sm font-medium text-gray-700">
                  Čas příjezdu zpět
                </label>
                <input
                  type="time"
                  id="logisticsReturnTime"
                  value={logisticsReturnTime}
                  onChange={(e) => setLogisticsReturnTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="logisticsTravelDuration" className="block text-sm font-medium text-gray-700">
                  Délka dopravy tam (min)
                </label>
                <input
                  type="number"
                  id="logisticsTravelDuration"
                  value={logisticsTravelDuration}
                  onChange={(e) => setLogisticsTravelDuration(e.target.value)}
                  placeholder="např. 90"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="logisticsTotalKilometers" className="block text-sm font-medium text-gray-700">
                  Kilometry tam a zpět
                </label>
                <input
                  type="number"
                  id="logisticsTotalKilometers"
                  value={logisticsTotalKilometers}
                  onChange={(e) => setLogisticsTotalKilometers(e.target.value)}
                  placeholder="např. 150"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="logisticsTransportNotes" className="block text-sm font-medium text-gray-700">
                Poznámky k dopravě
              </label>
              <textarea
                id="logisticsTransportNotes"
                value={logisticsTransportNotes}
                onChange={(e) => setLogisticsTransportNotes(e.target.value)}
                rows={2}
                placeholder="Parkování, speciální požadavky, atd."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Kontaktní informace
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Hlavní kontakt, kontakt na místě, atd.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Primary Contact */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Hlavní kontakt</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primaryContactName" className="block text-sm font-medium text-gray-700">
                    Jméno
                  </label>
                  <input
                    type="text"
                    id="primaryContactName"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="primaryContactPhone" className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="primaryContactPhone"
                    value={primaryContactPhone}
                    onChange={(e) => setPrimaryContactPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="primaryContactEmail" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="primaryContactEmail"
                    value={primaryContactEmail}
                    onChange={(e) => setPrimaryContactEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="primaryContactIco" className="block text-sm font-medium text-gray-700">
                    IČO
                  </label>
                  <input
                    type="text"
                    id="primaryContactIco"
                    value={primaryContactIco}
                    onChange={(e) => setPrimaryContactIco(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="primaryContactCompanyName" className="block text-sm font-medium text-gray-700">
                  Název firmy objednavatele
                </label>
                <input
                  type="text"
                  id="primaryContactCompanyName"
                  value={primaryContactCompanyName}
                  onChange={(e) => setPrimaryContactCompanyName(e.target.value)}
                  placeholder="např. Základní škola Nad Přehradou"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* On-site Contact */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Kontakt na místě</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="onSiteContactName" className="block text-sm font-medium text-gray-700">
                    Jméno
                  </label>
                  <input
                    type="text"
                    id="onSiteContactName"
                    value={onSiteContactName}
                    onChange={(e) => setOnSiteContactName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="onSiteContactPhone" className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="onSiteContactPhone"
                    value={onSiteContactPhone}
                    onChange={(e) => setOnSiteContactPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Divadlo On-site */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Divadlo na místě</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="divadloOnSiteName" className="block text-sm font-medium text-gray-700">
                    Jméno
                  </label>
                  <input
                    type="text"
                    id="divadloOnSiteName"
                    value={divadloOnSiteName}
                    onChange={(e) => setDivadloOnSiteName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="divadloOnSitePhone" className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="divadloOnSitePhone"
                    value={divadloOnSitePhone}
                    onChange={(e) => setDivadloOnSitePhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Dokumenty
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Čísla objednávek a smluv
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div>
              <label htmlFor="customerOrderNumber" className="block text-sm font-medium text-gray-700">
                Číslo objednávky zákazníka
              </label>
              <input
                type="text"
                id="customerOrderNumber"
                value={customerOrderNumber}
                onChange={(e) => setCustomerOrderNumber(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label htmlFor="contractNumber" className="block text-sm font-medium text-gray-700">
                Číslo smlouvy
              </label>
              <input
                type="text"
                id="contractNumber"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Communication */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Komunikace
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Zprávy a interní poznámky
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div>
              <label htmlFor="contactMessage" className="block text-sm font-medium text-gray-700">
                Zpráva od zákazníka
              </label>
              <textarea
                id="contactMessage"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Původní zpráva z kontaktního formuláře..."
              />
            </div>

            <div>
              <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700">
                Interní poznámky
              </label>
              <textarea
                id="internalNotes"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Interní poznámky týmu..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Ukládám...' : order ? 'Uložit změny' : 'Vytvořit objednávku'}
        </button>
      </div>

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </form>
  )
}
