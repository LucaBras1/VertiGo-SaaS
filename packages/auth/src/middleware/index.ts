/**
 * @vertigo/auth - Middleware
 * Export all middleware functions
 */

export { withAuth, type AuthenticatedRequest } from './with-auth'
export { withRole, withAdmin } from './with-role'
export { withTenant, type TenantRequest } from './with-tenant'
