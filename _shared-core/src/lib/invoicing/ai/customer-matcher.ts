/**
 * Customer Matcher
 *
 * AI modul pro automatické rozpoznání zákazníka z textu, emailu nebo dokumentu.
 * Používá fuzzy matching a NLP techniky pro identifikaci zákazníků.
 */

import prisma from '@/lib/prisma'

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerMatch {
  customer: CustomerInfo
  confidence: number // 0-1
  matchedFields: MatchedField[]
}

export interface CustomerInfo {
  id: string
  name: string
  email: string | null
  phone: string | null
  ico: string | null
  dic: string | null
  address: string | null
}

export interface MatchedField {
  field: 'name' | 'email' | 'ico' | 'dic' | 'phone' | 'address'
  value: string
  extractedValue: string
  similarity: number
}

export interface ExtractedData {
  names: string[]
  emails: string[]
  phones: string[]
  icos: string[]
  dics: string[]
  addresses: string[]
}

// ============================================================================
// REGEX PATTERNS
// ============================================================================

const PATTERNS = {
  // IČO: 8 číslic
  ico: /\b(?:IČO?|IC|ičo|ic)\s*[:\-]?\s*(\d{8})\b|\b(\d{8})\b/gi,

  // DIČ: CZ + 8-10 číslic
  dic: /\b(?:DIČ|DIC|dič|dic)\s*[:\-]?\s*(CZ\d{8,10})\b|(CZ\d{8,10})\b/gi,

  // Email
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,

  // Telefon (české formáty)
  phone:
    /(?:\+420\s?)?(?:\d{3}\s?\d{3}\s?\d{3}|\d{9})|(?:\+420[-\s]?)?\d{3}[-\s]?\d{3}[-\s]?\d{3}/g,

  // Adresa (základní pattern pro českou adresu)
  address: /(?:ul\.\s*)?[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+\s+\d+[a-z]?(?:\/\d+)?[,\s]+\d{3}\s?\d{2}\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+/gi,
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Najde nejlepší shodu zákazníka z textu
 */
export async function matchCustomerFromText(
  text: string,
  minConfidence: number = 0.5
): Promise<CustomerMatch[]> {
  // Extrahovat data z textu
  const extracted = extractDataFromText(text)

  // Získat všechny zákazníky
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      ico: true,
      dic: true,
      billingStreet: true,
      billingCity: true,
      billingZip: true,
    },
  })

  const matches: CustomerMatch[] = []

  for (const customer of customers) {
    const matchedFields: MatchedField[] = []
    let totalScore = 0
    let maxPossibleScore = 0

    // Přesná shoda IČO (nejvyšší váha)
    if (customer.ico) {
      maxPossibleScore += 40
      for (const ico of extracted.icos) {
        if (normalizeIco(customer.ico) === normalizeIco(ico)) {
          matchedFields.push({
            field: 'ico',
            value: customer.ico,
            extractedValue: ico,
            similarity: 1,
          })
          totalScore += 40
          break
        }
      }
    }

    // Přesná shoda DIČ (vysoká váha)
    if (customer.dic) {
      maxPossibleScore += 35
      for (const dic of extracted.dics) {
        if (normalizeDic(customer.dic) === normalizeDic(dic)) {
          matchedFields.push({
            field: 'dic',
            value: customer.dic,
            extractedValue: dic,
            similarity: 1,
          })
          totalScore += 35
          break
        }
      }
    }

    // Shoda emailu (střední váha)
    if (customer.email) {
      maxPossibleScore += 25
      for (const email of extracted.emails) {
        if (customer.email.toLowerCase() === email.toLowerCase()) {
          matchedFields.push({
            field: 'email',
            value: customer.email,
            extractedValue: email,
            similarity: 1,
          })
          totalScore += 25
          break
        }
      }
    }

    // Shoda telefonu
    if (customer.phone) {
      maxPossibleScore += 15
      for (const phone of extracted.phones) {
        if (normalizePhone(customer.phone) === normalizePhone(phone)) {
          matchedFields.push({
            field: 'phone',
            value: customer.phone,
            extractedValue: phone,
            similarity: 1,
          })
          totalScore += 15
          break
        }
      }
    }

    // Fuzzy shoda jména
    maxPossibleScore += 20
    const nameSimilarity = findBestNameMatch(customer.name, extracted.names, text)
    if (nameSimilarity > 0.7) {
      matchedFields.push({
        field: 'name',
        value: customer.name,
        extractedValue: extracted.names[0] || text.substring(0, 50),
        similarity: nameSimilarity,
      })
      totalScore += 20 * nameSimilarity
    }

    // Vypočítat confidence
    const confidence = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0

    if (confidence >= minConfidence && matchedFields.length > 0) {
      const address = [customer.billingStreet, customer.billingZip, customer.billingCity]
        .filter(Boolean)
        .join(', ')

      matches.push({
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          ico: customer.ico,
          dic: customer.dic,
          address: address || null,
        },
        confidence,
        matchedFields,
      })
    }
  }

  // Seřadit podle confidence
  return matches.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Najde zákazníka podle IČO nebo DIČ
 */
export async function findCustomerByIdentifier(
  identifier: string
): Promise<CustomerInfo | null> {
  const normalized = identifier.replace(/\s/g, '').toUpperCase()

  // Zkusit jako DIČ
  if (normalized.startsWith('CZ')) {
    const customer = await prisma.customer.findFirst({
      where: { dic: { equals: normalized, mode: 'insensitive' } },
    })
    if (customer) {
      return formatCustomerInfo(customer)
    }
  }

  // Zkusit jako IČO
  const icoNormalized = normalized.replace(/^CZ/, '')
  if (/^\d{8}$/.test(icoNormalized)) {
    const customer = await prisma.customer.findFirst({
      where: { ico: icoNormalized },
    })
    if (customer) {
      return formatCustomerInfo(customer)
    }
  }

  return null
}

/**
 * Navrhne zákazníky při psaní (autocomplete)
 */
export async function suggestCustomers(
  query: string,
  limit: number = 5
): Promise<CustomerInfo[]> {
  if (query.length < 2) {
    return []
  }

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { ico: { contains: query } },
        { dic: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: [{ invoices: { _count: 'desc' } }, { name: 'asc' }],
  })

  return customers.map(formatCustomerInfo)
}

// ============================================================================
// EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extrahuje strukturovaná data z textu
 */
export function extractDataFromText(text: string): ExtractedData {
  const result: ExtractedData = {
    names: [],
    emails: [],
    phones: [],
    icos: [],
    dics: [],
    addresses: [],
  }

  // Extrahovat emaily
  const emails = text.match(PATTERNS.email)
  if (emails) {
    result.emails = [...new Set(emails.map((e) => e.toLowerCase()))]
  }

  // Extrahovat IČO
  const icoMatches = [...text.matchAll(PATTERNS.ico)]
  for (const match of icoMatches) {
    const ico = match[1] || match[2]
    if (ico && isValidIco(ico)) {
      result.icos.push(ico)
    }
  }
  result.icos = [...new Set(result.icos)]

  // Extrahovat DIČ
  const dicMatches = [...text.matchAll(PATTERNS.dic)]
  for (const match of dicMatches) {
    const dic = match[1] || match[2]
    if (dic) {
      result.dics.push(dic.toUpperCase())
    }
  }
  result.dics = [...new Set(result.dics)]

  // Extrahovat telefony
  const phones = text.match(PATTERNS.phone)
  if (phones) {
    result.phones = [...new Set(phones.map(normalizePhone))]
  }

  // Extrahovat adresy
  const addresses = text.match(PATTERNS.address)
  if (addresses) {
    result.addresses = [...new Set(addresses)]
  }

  // Extrahovat potenciální jména firem
  result.names = extractCompanyNames(text)

  return result
}

/**
 * Extrahuje potenciální jména firem z textu
 */
function extractCompanyNames(text: string): string[] {
  const names: string[] = []

  // Hledat vzory jako "Firma:", "Odběratel:", "Zákazník:" atd.
  const labelPatterns = [
    /(?:firma|společnost|odběratel|zákazník|klient|dodavatel)\s*[:\-]\s*([^\n,;]{3,50})/gi,
    /(?:s\.r\.o\.|a\.s\.|spol\. s r\.o\.|v\.o\.s\.|k\.s\.)[,\s]*([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][^\n,;]{2,40})/gi,
  ]

  for (const pattern of labelPatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      const name = match[1].trim()
      if (name.length >= 3 && name.length <= 100) {
        names.push(name)
      }
    }
  }

  // Hledat názvy s právní formou
  const companyFormPattern =
    /([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýžA-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s&]+)\s*(?:s\.r\.o\.|a\.s\.|spol\. s r\.o\.|v\.o\.s\.|k\.s\.)/gi
  const companyMatches = [...text.matchAll(companyFormPattern)]
  for (const match of companyMatches) {
    const name = match[0].trim()
    if (name.length >= 5) {
      names.push(name)
    }
  }

  return [...new Set(names)]
}

// ============================================================================
// MATCHING HELPERS
// ============================================================================

/**
 * Levenshtein distance pro fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length

  if (m === 0) return n
  if (n === 0) return m

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }

  return dp[m][n]
}

/**
 * Vypočítá podobnost dvou řetězců (0-1)
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  if (s1 === s2) return 1

  const distance = levenshteinDistance(s1, s2)
  const maxLength = Math.max(s1.length, s2.length)

  return maxLength > 0 ? 1 - distance / maxLength : 0
}

/**
 * Najde nejlepší shodu jména
 */
function findBestNameMatch(
  customerName: string,
  extractedNames: string[],
  fullText: string
): number {
  let bestSimilarity = 0

  // Porovnat s extrahovanými jmény
  for (const name of extractedNames) {
    const similarity = stringSimilarity(customerName, name)
    bestSimilarity = Math.max(bestSimilarity, similarity)
  }

  // Také zkusit najít jméno v plném textu
  const normalizedCustomerName = customerName.toLowerCase()
  if (fullText.toLowerCase().includes(normalizedCustomerName)) {
    bestSimilarity = Math.max(bestSimilarity, 0.95)
  }

  // Zkusit části jména
  const nameParts = customerName.split(/\s+/)
  if (nameParts.length > 1) {
    let partsFound = 0
    for (const part of nameParts) {
      if (part.length >= 3 && fullText.toLowerCase().includes(part.toLowerCase())) {
        partsFound++
      }
    }
    const partialMatch = partsFound / nameParts.length
    bestSimilarity = Math.max(bestSimilarity, partialMatch * 0.8)
  }

  return bestSimilarity
}

// ============================================================================
// NORMALIZATION HELPERS
// ============================================================================

function normalizeIco(ico: string): string {
  return ico.replace(/\s/g, '').padStart(8, '0')
}

function normalizeDic(dic: string): string {
  return dic.replace(/\s/g, '').toUpperCase()
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\+]/g, '').replace(/^420/, '')
}

function isValidIco(ico: string): boolean {
  // Základní validace českého IČO
  const normalized = normalizeIco(ico)
  if (!/^\d{8}$/.test(normalized)) return false

  // Kontrolní součet
  const weights = [8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 7; i++) {
    sum += parseInt(normalized[i]) * weights[i]
  }
  const remainder = sum % 11
  const checkDigit = remainder === 0 ? 1 : remainder === 1 ? 0 : 11 - remainder

  return parseInt(normalized[7]) === checkDigit
}

function formatCustomerInfo(customer: {
  id: string
  name: string
  email: string | null
  phone: string | null
  ico: string | null
  dic: string | null
  billingStreet?: string | null
  billingCity?: string | null
  billingZip?: string | null
}): CustomerInfo {
  const address = [customer.billingStreet, customer.billingZip, customer.billingCity]
    .filter(Boolean)
    .join(', ')

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    ico: customer.ico,
    dic: customer.dic,
    address: address || null,
  }
}

// ============================================================================
// EMAIL PARSING
// ============================================================================

/**
 * Parsuje email a hledá zákazníka
 */
export async function matchCustomerFromEmail(
  emailContent: string,
  senderEmail?: string
): Promise<CustomerMatch[]> {
  // Kombinovat obsah emailu s emailem odesílatele
  let searchText = emailContent

  if (senderEmail) {
    searchText += `\n${senderEmail}`
  }

  return matchCustomerFromText(searchText, 0.4)
}

/**
 * Parsuje data z faktury nebo dokumentu
 */
export async function matchCustomerFromDocument(
  documentText: string
): Promise<CustomerMatch[]> {
  // Pro dokumenty požadujeme vyšší confidence
  return matchCustomerFromText(documentText, 0.6)
}
