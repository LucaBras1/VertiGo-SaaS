/**
 * @vertigo/auth - Constants
 * Default values and error messages
 */

import type { ErrorMessages } from './types'

/**
 * Default session max age: 30 days in seconds
 */
export const DEFAULT_SESSION_MAX_AGE = 30 * 24 * 60 * 60

/**
 * Bcrypt salt rounds
 */
export const BCRYPT_SALT_ROUNDS = 12

/**
 * Error messages by locale
 */
export const ERROR_MESSAGES: Record<'en' | 'cs', ErrorMessages> = {
  en: {
    emailPasswordRequired: 'Email and password are required',
    invalidCredentials: 'Invalid email or password',
  },
  cs: {
    emailPasswordRequired: 'Email a heslo jsou povinné',
    invalidCredentials: 'Nesprávný email nebo heslo',
  },
}
