/**
 * Vyfakturuj.cz API Client
 *
 * Klient pro komunikaci s Vyfakturuj.cz REST API v3.0
 * Podporuje správu faktur, kontaktů, platebních metod a další funkce.
 *
 * @see https://app.vyfakturuj.cz/api/3.0/
 */

import type {
  VyfakturujInvoice,
  VyfakturujContact,
  VyfakturujPaymentMethod,
  VyfakturujNumberSeries,
  VyfakturujTag,
  CreateInvoiceData,
  UpdateInvoiceData,
  CreateContactData,
  UpdateContactData,
  CreateTagData,
  UpdateTagData,
  ListParams,
  VyfakturujInvoiceItem,
} from '@/types/vyfakturuj'

// ============================================================================
// TYPES
// ============================================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/**
 * Výsledek testu spojení
 */
export interface TestResult {
  success: boolean
  message: string
  email?: string
}

/**
 * Chybová odpověď z API
 */
interface ApiErrorResponse {
  error?: string
  message?: string
  errors?: Record<string, string[]>
  status?: string
}

/**
 * Konfigurace retry logiky
 */
interface RetryConfig {
  maxRetries: number
  retryDelay: number
  retryableStatusCodes: number[]
}

/**
 * Výchozí konfigurace retry
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}

// ============================================================================
// ERROR CLASS
// ============================================================================

/**
 * Vlastní chyba pro Vyfakturuj API
 */
export class VyfakturujApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: ApiErrorResponse
  ) {
    super(message)
    this.name = 'VyfakturujApiError'
  }
}

// ============================================================================
// CLIENT CLASS
// ============================================================================

/**
 * Vyfakturuj.cz API Client
 *
 * @example
 * ```typescript
 * const client = new VyfakturujClient('user@example.com', 'api-key');
 * const invoice = await client.getInvoice(123);
 * ```
 */
export class VyfakturujClient {
  private readonly baseUrl = 'https://app.vyfakturuj.cz/api/3.0'
  private readonly authHeader: string
  private readonly retryConfig: RetryConfig

  /**
   * Vytvoří novou instanci klienta
   *
   * @param email - Email účtu Vyfakturuj.cz
   * @param apiKey - API klíč
   * @param retryConfig - Volitelná konfigurace retry logiky
   */
  constructor(
    private readonly email: string,
    private readonly apiKey: string,
    retryConfig?: Partial<RetryConfig>
  ) {
    // Basic Auth: email:apiKey -> Base64
    const credentials = Buffer.from(`${email}:${apiKey}`).toString('base64')
    this.authHeader = `Basic ${credentials}`

    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig,
    }

    this.log('Client initialized', { email })
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Logování pro debugging (aktivní pouze v development nebo s VYFAKTURUJ_DEBUG)
   */
  private log(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development' || process.env.VYFAKTURUJ_DEBUG) {
      console.log(`[VyfakturujClient] ${message}`, data ?? '')
    }
  }

  /**
   * Čekání před retry
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Kontrola, zda lze chybu opakovat
   */
  private isRetryable(statusCode?: number): boolean {
    if (!statusCode) return false
    return this.retryConfig.retryableStatusCodes.includes(statusCode)
  }

  /**
   * Hlavní metoda pro HTTP požadavky
   */
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        this.log(`${method} ${endpoint}`, {
          attempt: attempt + 1,
          hasData: !!data,
        })

        const response = await fetch(url, {
          method,
          headers: {
            Authorization: this.authHeader,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        })

        // Úspěšná odpověď
        if (response.ok) {
          if (method === 'DELETE') {
            this.log(`${method} ${endpoint} - Success (no content)`)
            return undefined as T
          }

          const result = await response.json()
          this.log(`${method} ${endpoint} - Success`, { status: response.status })
          return result as T
        }

        // Chybová odpověď
        let errorData: ApiErrorResponse = {}
        try {
          errorData = await response.json()
        } catch {
          // Ignoruj pokud není JSON
        }

        const errorMessage =
          errorData.error || errorData.message || `API error: ${response.status}`

        this.log(`${method} ${endpoint} - Error`, {
          status: response.status,
          error: errorMessage,
        })

        // Retry pokud je to možné
        if (this.isRetryable(response.status) && attempt < this.retryConfig.maxRetries) {
          const delay = this.retryConfig.retryDelay * (attempt + 1)
          this.log(`Retrying after ${delay}ms...`)
          await this.sleep(delay)
          continue
        }

        throw new VyfakturujApiError(errorMessage, response.status, errorData)
      } catch (error) {
        lastError = error as Error

        if (error instanceof VyfakturujApiError) {
          throw error
        }

        // Network error - zkus retry
        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.retryConfig.retryDelay * (attempt + 1)
          this.log(`Network error, retrying after ${delay}ms...`, {
            error: (error as Error).message,
          })
          await this.sleep(delay)
          continue
        }

        throw new VyfakturujApiError(`Network error: ${(error as Error).message}`)
      }
    }

    throw lastError || new Error('Unknown error')
  }

  // ============================================================================
  // TEST CONNECTION
  // ============================================================================

  /**
   * Test spojení s API
   */
  async test(): Promise<TestResult> {
    try {
      // Pokusíme se načíst seznam faktur s limitem 1
      await this.request<VyfakturujInvoice[]>('GET', '/invoice/?rows_limit=1')
      return {
        success: true,
        message: 'Spojení úspěšné',
        email: this.email,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof VyfakturujApiError ? error.message : 'Spojení selhalo',
      }
    }
  }

  // ============================================================================
  // INVOICES (FAKTURY)
  // ============================================================================

  /**
   * Vytvoří novou fakturu
   */
  async createInvoice(data: CreateInvoiceData): Promise<VyfakturujInvoice> {
    return this.request<VyfakturujInvoice>('POST', '/invoice/', data)
  }

  /**
   * Získá fakturu podle ID
   */
  async getInvoice(id: number): Promise<VyfakturujInvoice> {
    return this.request<VyfakturujInvoice>('GET', `/invoice/${id}/`)
  }

  /**
   * Aktualizuje fakturu
   */
  async updateInvoice(id: number, data: UpdateInvoiceData): Promise<VyfakturujInvoice> {
    return this.request<VyfakturujInvoice>('PUT', `/invoice/${id}/`, data)
  }

  /**
   * Smaže fakturu
   */
  async deleteInvoice(id: number): Promise<void> {
    return this.request<void>('DELETE', `/invoice/${id}/`)
  }

  /**
   * Získá seznam faktur
   */
  async listInvoices(params?: ListParams): Promise<VyfakturujInvoice[]> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const query = queryParams.toString()
    const endpoint = query ? `/invoice/?${query}` : '/invoice/'

    return this.request<VyfakturujInvoice[]>('GET', endpoint)
  }

  /**
   * Označí fakturu jako zaplacenou
   *
   * @param id - ID faktury
   * @param date - Datum zaplacení (YYYY-MM-DD)
   * @param amount - Zaplacená částka
   */
  async setInvoicePaid(
    id: number,
    date: string,
    amount: number
  ): Promise<VyfakturujInvoice> {
    return this.request<VyfakturujInvoice>('PUT', `/invoice/${id}/`, {
      pay: {
        date_paid: date,
        amount: amount,
      },
    })
  }

  /**
   * Odešle fakturu emailem
   *
   * @param id - ID faktury
   * @param to - Emailové adresy příjemců
   */
  async sendInvoiceEmail(id: number, to: string[]): Promise<void> {
    return this.request<void>('POST', `/invoice/${id}/send-mail/`, {
      to: to,
    })
  }

  /**
   * Vytvoří opravný doklad (dobropis) k faktuře
   *
   * @param parentId - ID rodičovské faktury
   * @param items - Položky dobropisu (s minusovými cenami)
   */
  async createCreditNote(
    parentId: number,
    items: Partial<VyfakturujInvoiceItem>[]
  ): Promise<VyfakturujInvoice> {
    return this.request<VyfakturujInvoice>('POST', `/invoice/${parentId}/corrective/`, {
      items,
    })
  }

  /**
   * Stáhne PDF faktury
   *
   * @param id - ID faktury
   * @returns URL pro stažení PDF
   */
  async getInvoicePdfUrl(id: number): Promise<string> {
    const invoice = await this.getInvoice(id)
    return invoice.url_download_pdf
  }

  // ============================================================================
  // CONTACTS (ADRESÁŘ)
  // ============================================================================

  /**
   * Vytvoří nový kontakt
   */
  async createContact(data: CreateContactData): Promise<VyfakturujContact> {
    return this.request<VyfakturujContact>('POST', '/contact/', data)
  }

  /**
   * Získá kontakt podle ID
   */
  async getContact(id: number): Promise<VyfakturujContact> {
    return this.request<VyfakturujContact>('GET', `/contact/${id}/`)
  }

  /**
   * Aktualizuje kontakt
   */
  async updateContact(id: number, data: UpdateContactData): Promise<VyfakturujContact> {
    return this.request<VyfakturujContact>('PUT', `/contact/${id}/`, data)
  }

  /**
   * Smaže kontakt
   */
  async deleteContact(id: number): Promise<void> {
    return this.request<void>('DELETE', `/contact/${id}/`)
  }

  /**
   * Získá seznam kontaktů
   */
  async listContacts(params?: ListParams): Promise<VyfakturujContact[]> {
    const queryParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const query = queryParams.toString()
    const endpoint = query ? `/contact/?${query}` : '/contact/'

    return this.request<VyfakturujContact[]>('GET', endpoint)
  }

  /**
   * Vyhledá kontakty podle textu
   */
  async searchContacts(query: string): Promise<VyfakturujContact[]> {
    return this.listContacts({ q: query })
  }

  /**
   * Najde kontakt podle IČO
   */
  async findContactByIco(ico: string): Promise<VyfakturujContact | null> {
    const contacts = await this.listContacts({ q: ico })
    return contacts.find((c) => c.IC === ico) || null
  }

  /**
   * Najde kontakt podle emailu
   */
  async findContactByEmail(email: string): Promise<VyfakturujContact | null> {
    const contacts = await this.listContacts({ q: email })
    return contacts.find((c) => c.mail_to === email) || null
  }

  // ============================================================================
  // SETTINGS (NASTAVENÍ)
  // ============================================================================

  /**
   * Získá seznam platebních metod
   */
  async getPaymentMethods(): Promise<VyfakturujPaymentMethod[]> {
    return this.request<VyfakturujPaymentMethod[]>('GET', '/settings/payment-method/')
  }

  /**
   * Získá seznam číselných řad
   */
  async getNumberSeries(): Promise<VyfakturujNumberSeries[]> {
    return this.request<VyfakturujNumberSeries[]>('GET', '/settings/number-series/')
  }

  /**
   * Získá seznam štítků
   */
  async getTags(): Promise<VyfakturujTag[]> {
    return this.request<VyfakturujTag[]>('GET', '/settings/tags/')
  }

  /**
   * Vytvoří nový štítek
   */
  async createTag(data: CreateTagData): Promise<VyfakturujTag> {
    return this.request<VyfakturujTag>('POST', '/settings/tag/', data)
  }

  /**
   * Aktualizuje štítek
   */
  async updateTag(id: number, data: UpdateTagData): Promise<VyfakturujTag> {
    return this.request<VyfakturujTag>('PUT', `/settings/tag/${id}`, data)
  }

  /**
   * Smaže štítek
   */
  async deleteTag(id: number): Promise<void> {
    return this.request<void>('DELETE', `/settings/tag/${id}`)
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Tovární funkce pro vytvoření instance klienta
 *
 * @example
 * ```typescript
 * const client = createVyfakturujClient(
 *   process.env.VYFAKTURUJ_EMAIL!,
 *   process.env.VYFAKTURUJ_API_KEY!
 * );
 * ```
 */
export function createVyfakturujClient(
  email: string,
  apiKey: string
): VyfakturujClient {
  return new VyfakturujClient(email, apiKey)
}

/**
 * Vytvoří klienta z environment variables
 *
 * @throws Error pokud nejsou nastaveny env proměnné
 */
export function createVyfakturujClientFromEnv(): VyfakturujClient {
  const email = process.env.VYFAKTURUJ_API_EMAIL
  const apiKey = process.env.VYFAKTURUJ_API_KEY

  if (!email || !apiKey) {
    throw new Error(
      'Missing VYFAKTURUJ_API_EMAIL or VYFAKTURUJ_API_KEY environment variables'
    )
  }

  return new VyfakturujClient(email, apiKey)
}
