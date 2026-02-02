/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

type EnvVar = {
  name: string
  required: boolean
  description: string
}

const requiredEnvVars: EnvVar[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string',
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'NextAuth.js secret for session encryption',
  },
  {
    name: 'NEXTAUTH_URL',
    required: true,
    description: 'Base URL of the application',
  },
]

const paymentEnvVars: EnvVar[] = [
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe secret API key',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    description: 'Stripe webhook signing secret',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    description: 'Stripe publishable key for client-side',
  },
]

const emailEnvVars: EnvVar[] = [
  {
    name: 'RESEND_API_KEY',
    required: true,
    description: 'Resend API key for sending emails',
  },
]

const optionalEnvVars: EnvVar[] = [
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key for AI features (fallback mode if not set)',
  },
]

export type ValidationResult = {
  valid: boolean
  missing: string[]
  warnings: string[]
}

/**
 * Validate all required environment variables
 * Call this at application startup
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  const allRequired = [...requiredEnvVars, ...paymentEnvVars, ...emailEnvVars]

  // Check required variables
  for (const envVar of allRequired) {
    const value = process.env[envVar.name]
    if (!value || value.trim() === '') {
      missing.push(`${envVar.name} - ${envVar.description}`)
    }
  }

  // Check optional variables (warn only)
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar.name]
    if (!value || value.trim() === '') {
      warnings.push(`${envVar.name} not set - ${envVar.description}`)
    }
  }

  // Additional validation for specific formats
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    missing.push('DATABASE_URL must start with postgresql://')
  }

  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    missing.push('STRIPE_SECRET_KEY must start with sk_')
  }

  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('http')) {
    missing.push('NEXTAUTH_URL must be a valid URL starting with http:// or https://')
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Validate environment and throw if invalid
 * Use this for critical startup validation
 */
export function assertValidEnvironment(): void {
  const result = validateEnvironment()

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:')
    result.warnings.forEach(w => console.warn(`   - ${w}`))
  }

  if (!result.valid) {
    console.error('\n❌ Missing required environment variables:')
    result.missing.forEach(m => console.error(`   - ${m}`))
    console.error('\nPlease set these variables in your .env file or environment.\n')

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables')
    }
  }
}

/**
 * Get environment info for health checks
 */
export function getEnvironmentInfo(): {
  nodeEnv: string
  hasDatabase: boolean
  hasStripe: boolean
  hasEmail: boolean
  hasAI: boolean
} {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    hasDatabase: !!process.env.DATABASE_URL,
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
    hasEmail: !!process.env.RESEND_API_KEY,
    hasAI: !!process.env.OPENAI_API_KEY,
  }
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if AI features are available
 */
export function isAIAvailable(): boolean {
  const apiKey = process.env.OPENAI_API_KEY
  return !!apiKey && apiKey.trim() !== '' && !apiKey.startsWith('sk-test')
}

/**
 * Get the base URL of the application
 */
export function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || 'http://localhost:3002'
}
