/**
 * @vertigo/auth - Utils
 * Export all utility functions
 */

export { hashPassword, verifyPassword } from './password'
export {
  requireAuth,
  requireRole,
  getSession,
  isAuthenticated,
  hasRole,
  getTenantId,
  AuthenticationError,
  AuthorizationError,
} from './session'
