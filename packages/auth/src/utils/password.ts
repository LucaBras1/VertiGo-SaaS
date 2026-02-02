/**
 * @vertigo/auth - Password Utilities
 * Secure password hashing and verification
 */

import { hash, compare } from 'bcryptjs'
import { BCRYPT_SALT_ROUNDS } from '../constants'

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 * @param password Plain text password
 * @param hashedPassword Stored hash
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}
