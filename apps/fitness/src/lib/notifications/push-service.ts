/**
 * Push Notification Service for FitAdmin
 *
 * Handles Web Push notifications using VAPID keys.
 * Supports notifications for sessions, classes, invoices, payments, and at-risk alerts.
 *
 * TODO: Enable when PushSubscription, NotificationPreference, and NotificationLog models are added to schema
 */

import webpush from 'web-push'

// Initialize web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

// Types
export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: {
    url?: string
    type?: string
    entityId?: string
  }
  tag?: string
  requireInteraction?: boolean
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export type NotificationType =
  | 'session_reminder'
  | 'class_reminder'
  | 'invoice'
  | 'payment'
  | 'at_risk'
  | 'general'

export type RecipientType = 'user' | 'client'

// Check if web push is configured
export function isWebPushConfigured(): boolean {
  return !!(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT
  )
}

// Get VAPID public key for client-side subscription
export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || null
}

/**
 * Send a push notification to a specific subscription
 *
 * TODO: Enable full functionality when PushSubscription model is added to schema
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: NotificationPayload
): Promise<boolean> {
  if (!isWebPushConfigured()) {
    console.warn('[PushService] Web Push not configured, skipping notification')
    return false
  }

  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    }

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icons/notification-icon.png',
        badge: payload.badge || '/icons/badge-icon.png',
        data: payload.data,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
      })
    )

    return true
  } catch (error: any) {
    console.error('[PushService] Failed to send push notification:', error)
    // Note: Subscription deactivation is not available - PushSubscription model pending
    return false
  }
}

/**
 * Send notification to a user or client via preferred channels
 *
 * TODO: Enable when NotificationPreference, PushSubscription, and NotificationLog models are added to schema
 */
export async function sendNotification(
  recipientType: RecipientType,
  recipientId: string,
  notification: NotificationPayload,
  tenantId: string,
  type: NotificationType = 'general'
): Promise<{ push: boolean; email: boolean }> {
  console.warn('[PushService] Notification sending not yet implemented - Prisma models pending')
  return { push: false, email: false }
}

/**
 * Send session reminder notifications
 *
 * TODO: Enable when required Prisma models are added
 */
export async function sendSessionReminder(
  sessionId: string,
  tenantId: string
): Promise<void> {
  console.warn('[PushService] Session reminder not yet implemented - Prisma models pending')
}

/**
 * Send class reminder notifications
 *
 * TODO: Enable when required Prisma models are added
 */
export async function sendClassReminder(
  classId: string,
  tenantId: string
): Promise<void> {
  console.warn('[PushService] Class reminder not yet implemented - Prisma models pending')
}

/**
 * Send invoice notification
 *
 * TODO: Enable when required Prisma models are added
 */
export async function sendInvoiceNotification(
  invoiceId: string,
  tenantId: string
): Promise<void> {
  console.warn('[PushService] Invoice notification not yet implemented - Prisma models pending')
}

/**
 * Send payment received notification to trainer
 *
 * TODO: Enable when required Prisma models are added
 */
export async function sendPaymentNotification(
  invoiceId: string,
  tenantId: string,
  trainerId: string
): Promise<void> {
  console.warn('[PushService] Payment notification not yet implemented - Prisma models pending')
}

/**
 * Send at-risk client alert to trainer
 *
 * TODO: Enable when required Prisma models are added
 */
export async function sendAtRiskAlert(
  clientId: string,
  tenantId: string,
  trainerId: string,
  riskScore: number,
  reasons: string[]
): Promise<void> {
  console.warn('[PushService] At-risk alert not yet implemented - Prisma models pending')
}

/**
 * Register a new push subscription
 *
 * TODO: Enable when PushSubscription model is added to schema
 */
export async function registerSubscription(
  subscription: PushSubscriptionData,
  tenantId: string,
  recipientType: RecipientType,
  recipientId: string,
  userAgent?: string,
  deviceName?: string
): Promise<boolean> {
  console.warn('[PushService] Subscription registration not yet implemented - PushSubscription model pending')
  return false
}

/**
 * Unregister a push subscription
 *
 * TODO: Enable when PushSubscription model is added to schema
 */
export async function unregisterSubscription(endpoint: string): Promise<boolean> {
  console.warn('[PushService] Subscription unregistration not yet implemented - PushSubscription model pending')
  return false
}
