/**
 * ARES API Client
 * Client for Czech Business Register (ARES) - lookup company info by IČO
 * Documentation: https://ares.gov.cz/
 */

interface AresAddress {
  street?: string
  city?: string
  postalCode?: string
  country?: string
}

interface AresCompanyInfo {
  ico: string
  companyName: string
  dic?: string
  address?: AresAddress
  isActive: boolean
}

/**
 * Lookup company information from ARES by IČO (Company ID)
 * @param ico - Czech company ID (8 digits)
 * @returns Company information or null if not found
 */
export async function lookupCompanyByIco(ico: string): Promise<AresCompanyInfo | null> {
  try {
    // Clean ICO - remove spaces and non-digits
    const cleanIco = ico.replace(/\s/g, '').replace(/\D/g, '')

    if (cleanIco.length !== 8) {
      throw new Error('IČO musí mít 8 číslic')
    }

    // ARES API endpoint - using the new ARES API
    const url = `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${cleanIco}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // Company not found
      }
      throw new Error(`ARES API error: ${response.status}`)
    }

    const data = await response.json()

    // Parse ARES response
    const companyName = data.obchodniJmeno || data.nazev || ''
    const dic = data.dic || ''

    // Parse address
    let address: AresAddress | undefined

    if (data.sidlo) {
      const sidlo = data.sidlo

      // Construct street address
      let street = ''
      if (sidlo.nazevUlice) {
        street = sidlo.nazevUlice
        if (sidlo.cisloDomovni) {
          street += ` ${sidlo.cisloDomovni}`
          if (sidlo.cisloOrientacni) {
            street += `/${sidlo.cisloOrientacni}`
          }
        }
      } else if (sidlo.cisloDomovni) {
        street = `č.p. ${sidlo.cisloDomovni}`
      }

      address = {
        street: street || undefined,
        city: sidlo.nazevObce || undefined,
        postalCode: sidlo.psc ? sidlo.psc.toString() : undefined,
        country: 'Česká republika',
      }
    }

    // Check if company is active
    const isActive = data.stavZdrojVr !== 'ZANIKLY'

    return {
      ico: cleanIco,
      companyName,
      dic: dic || undefined,
      address,
      isActive,
    }
  } catch (error) {
    console.error('Error fetching ARES data:', error)
    throw error
  }
}

/**
 * Validate IČO format
 * @param ico - Company ID to validate
 * @returns true if valid format
 */
export function validateIco(ico: string): boolean {
  const cleanIco = ico.replace(/\s/g, '').replace(/\D/g, '')
  return cleanIco.length === 8
}

/**
 * Format IČO with spaces (12345678 -> 12 34 56 78)
 * @param ico - Company ID to format
 * @returns Formatted IČO
 */
export function formatIco(ico: string): string {
  const cleanIco = ico.replace(/\s/g, '').replace(/\D/g, '')
  if (cleanIco.length !== 8) return ico

  return `${cleanIco.slice(0, 2)} ${cleanIco.slice(2, 4)} ${cleanIco.slice(4, 6)} ${cleanIco.slice(6, 8)}`
}
