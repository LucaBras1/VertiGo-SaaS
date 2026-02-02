/**
 * Push Notification Service for FitAdmin
 *
 * Handles Web Push notifications using VAPID keys.
 * Supports notifications for sessions, classes, invoices, payments, and at-risk alerts.
 */

import webpush from 'web-push'
import { prisma } from '../prisma'
import { sendEmail } from '../email'

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

    // Deactivate subscription if it's gone
    if (error.statusCode === 404 || error.statusCode === 410) {
      await deactivateSubscription(subscription.endpoint)
    }

    return false
  }
}

/**
 * Deactivate a push subscription (e.g., when browser unregisters it)
 */
async function deactivateSubscription(endpoint: string): Promise<void> {
  try {
    await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false },
    })
  } catch (error) {
    console.error('[PushService] Failed to deactivate subscription:', error)
  }
}

/**
 * Get notification preferences for a recipient
 */
async function getNotificationPreferences(
  tenantId: string,
  recipientType: RecipientType,
  recipientId: string
): Promise<{
  pushEnabled: boolean
  emailEnabled: boolean
  sessionReminders: boolean
  classReminders: boolean
  invoiceNotifications: boolean
  paymentNotifications: boolean
  atRiskAlerts: boolean
} | null> {
  const preferences = await prisma.notificationPreference.findFirst({
    where: recipientType === 'user'
      ? { tenantId, userId: recipientId }
      : { tenantId, clientId: recipientId },
  })

  if (!preferences) {
    // Return defaults
    return {
      pushEnabled: true,
      emailEnabled: true,
      sessionReminders: true,
      classReminders: true,
      invoiceNotifications: true,
      paymentNotifications: true,
      atRiskAlerts: true,
    }
  }

  return preferences
}

/**
 * Check if notification type is enabled for recipient
 */
function isNotificationTypeEnabled(
  preferences: NonNullable<Awaited<ReturnType<typeof getNotificationPreferences>>>,
  type: NotificationType
): boolean {
  switch (type) {
    case 'session_reminder':
      return preferences.sessionReminders
    case 'class_reminder':
      return preferences.classReminders
    case 'invoice':
      return preferences.invoiceNotifications
    case 'payment':
      return preferences.paymentNotifications
    case 'at_risk':
      return preferences.atRiskAlerts
    case 'general':
      return true
    default:
      return true
  }
}

/**
 * Log a notification
 */
async function logNotification(
  tenantId: string,
  type: NotificationType,
  recipientType: RecipientType,
  recipientId: string,
  notification: NotificationPayload,
  channel: 'push' | 'email' | 'both',
  status: 'pending' | 'sent' | 'failed',
  error?: string
): Promise<void> {
  await prisma.notificationLog.create({
    data: {
      tenantId,
      type,
      recipientType,
      recipientId,
      title: notification.title,
      body: notification.body,
      data: notification.data as any,
      channel,
      status,
      error,
      sentAt: status === 'sent' ? new Date() : null,
    },
  })
}

/**
 * Send notification to a user or client via preferred channels
 */
export async function sendNotification(
  recipientType: RecipientType,
  recipientId: string,
  notification: NotificationPayload,
  tenantId: string,
  type: NotificationType = 'general'
): Promise<{ push: boolean; email: boolean }> {
  const result = { push: false, email: false }

  try {
    // Get recipient preferences
    const preferences = await getNotificationPreferences(tenantId, recipientType, recipientId)
    if (!preferences || !isNotificationTypeEnabled(preferences, type)) {
      return result
    }

    // Get recipient email
    let recipientEmail: string | null = null
    if (preferences.emailEnabled) {
      if (recipientType === 'user') {
        const user = await prisma.user.findUnique({
          where: { id: recipientId },
          select: { email: true },
        })
        recipientEmail = user?.email || null
      } else {
        const client = await prisma.client.findUnique({
          where: { id: recipientId },
          select: { email: true },
        })
        recipientEmail = client?.email || null
      }
    }

    // Send push notification if enabled
    if (preferences.pushEnabled) {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          tenantId,
          isActive: true,
          ...(recipientType === 'user' ? { userId: recipientId } : { clientId: recipientId }),
        },
      })

      for (const sub of subscriptions) {
        const success = await sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          notification
        )
        if (success) {
          result.push = true
        }
      }
    }

    // Send email notification if enabled
    if (preferences.emailEnabled && recipientEmail) {
      try {
        await sendEmail({
          to: recipientEmail,
          subject: notification.title,
          text: notification.body,
          html: `<p>${notification.body}</p>`,
        })
        result.email = true
      } catch (error) {
        console.error('[PushService] Failed to send email notification:', error)
      }
    }

    // Log the notification
    const channel = result.push && result.email ? 'both' : result.push ? 'push' : 'email'
    const status = result.push || result.email ? 'sent' : 'failed'
    await logNotification(tenantId, type, recipientType, recipientId, notification, channel, status)

    return result
  } catch (error: any) {
    console.error('[PushService] Failed to send notification:', error)
    await logNotification(
      tenantId, type, recipientType, recipientId, notification, 'both', 'failed', error.message
    )
    return result
  }
}

/**
 * Send session reminder notifications
 */
export async function sendSessionReminder(
  sessionId: string,
  tenantId: string
): Promise<void> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        client: true,
        tenant: true,
      },
    })

    if (!session) {
      console.warn('[PushService] Session not found for reminder:', sessionId)
      return
    }

    const notification: NotificationPayload = {
      title: 'Training Session Reminder',
      body: `Your training session is starting soon at ${session.scheduledAt.toLocaleTimeString()}`,
      data: {
        type: 'session_reminder',
        entityId: sessionId,
        url: `/dashboard/sessions/${sessionId}`,
      },
      tag: `session-${sessionId}`,
      requireInteraction: true,
    }

    // Notify client
    await sendNotification('client', session.clientId, notification, tenantId, 'session_reminder')

    // Also notify trainer (tenant owner/users)
    const users = await prisma.user.findMany({
      where: { tenantId, role: { in: ['admin', 'trainer'] } },
    })

    for (const user of users) {
      await sendNotification('user', user.id, {
        ...notification,
        title: 'Upcoming Training Session',
        body: `Session with ${session.client.name} starting soon at ${session.scheduledAt.toLocaleTimeString()}`,
      }, tenantId, 'session_reminder')
    }
  } catch (error) {
    console.error('[PushService] Failed to send session reminder:', error)
  }
}

/**
 * Send class reminder notifications
 */
export async function sendClassReminder(
  classId: string,
  tenantId: string
): Promise<void> {
  try {
    const fitnessClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        bookings: true,
        tenant: true,
      },
    })

    if (!fitnessClass) {
      console.warn('[PushService] Class not found for reminder:', classId)
      return
    }

    const notification: NotificationPayload = {
      title: `${fitnessClass.name} - Class Reminder`,
      body: `Your class is starting soon at ${fitnessClass.scheduledAt.toLocaleTimeString()}`,
      data: {
        type: 'class_reminder',
        entityId: classId,
        url: `/dashboard/classes/${classId}`,
      },
      tag: `class-${classId}`,
      requireInteraction: true,
    }

    // Notify all booked clients
    for (const booking of fitnessClass.bookings) {
      if (booking.status === 'confirmed') {
        await sendNotification('client', booking.clientId, notification, tenantId, 'class_reminder')
      }
    }
  } catch (error) {
    console.error('[PushService] Failed to send class reminder:', error)
  }
}

/**
 * Send invoice notification
 */
export async function sendInvoiceNotification(
  invoiceId: string,
  tenantId: string
): Promise<void> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        tenant: true,
      },
    })

    if (!invoice) {
      console.warn('[PushService] Invoice not found:', invoiceId)
      return
    }

    const notification: NotificationPayload = {
      title: 'New Invoice',
      body: `You have a new invoice #${invoice.invoiceNumber} for ${invoice.total} ${invoice.client.name}`,
      data: {
        type: 'invoice',
        entityId: invoiceId,
        url: `/invoices/${invoiceId}`,
      },
      tag: `invoice-${invoiceId}`,
      requireInteraction: true,
    }

    await sendNotification('client', invoice.clientId, notification, tenantId, 'invoice')
  } catch (error) {
    console.error('[PushService] Failed to send invoice notification:', error)
  }
}

/**
 * Send payment received notification to trainer
 */
export async function sendPaymentNotification(
  invoiceId: string,
  tenantId: string,
  trainerId: string
): Promise<void> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        tenant: true,
      },
    })

    if (!invoice) {
      console.warn('[PushService] Invoice not found for payment notification:', invoiceId)
      return
    }

    const notification: NotificationPayload = {
      title: 'Payment Received',
      body: `Payment received for invoice #${invoice.invoiceNumber} from ${invoice.client.name}`,
      data: {
        type: 'payment',
        entityId: invoiceId,
        url: `/dashboard/invoices/${invoiceId}`,
      },
      tag: `payment-${invoiceId}`,
    }

    await sendNotification('user', trainerId, notification, tenantId, 'payment')
  } catch (error) {
    console.error('[PushService] Failed to send payment notification:', error)
  }
}

/**
 * Send at-risk client alert to trainer
 */
export async function sendAtRiskAlert(
  clientId: string,
  tenantId: string,
  trainerId: string,
  riskScore: number,
  reasons: string[]
): Promise<void> {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      console.warn('[PushService] Client not found for at-risk alert:', clientId)
      return
    }

    const notification: NotificationPayload = {
      title: 'At-Risk Client Alert',
      body: `${client.name} is at risk (score: ${riskScore}%). ${reasons[0] || 'Take action to retain them.'}`,
      data: {
        type: 'at_risk',
        entityId: clientId,
        url: `/dashboard/clients/${clientId}`,
      },
      tag: `at-risk-${clientId}`,
      requireInteraction: true,
    }

    await sendNotification('user', trainerId, notification, tenantId, 'at_risk')
  } catch (error) {
    console.error('[PushService] Failed to send at-risk alert:', error)
  }
}

/**
 * Register a new push subscription
 */
export async function registerSubscription(
  subscription: PushSubscriptionData,
  tenantId: string,
  recipientType: RecipientType,
  recipientId: string,
  userAgent?: string,
  deviceName?: string
): Promise<boolean> {
  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: {
        tenantId,
        userId: recipientType === 'user' ? recipientId : null,
        clientId: recipientType === 'client' ? recipientId : null,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
        deviceName,
        isActive: true,
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
        deviceName,
        isActive: true,
        updatedAt: new Date(),
      },
    })

    return true
  } catch (error) {
    console.error('[PushService] Failed to register subscription:', error)
    return false
  }
}

/**
 * Unregister a push subscription
 */
export async function unregisterSubscription(endpoint: string): Promise<boolean> {
  try {
    await prisma.pushSubscription.delete({
      where: { endpoint },
    })
    return true
  } catch (error) {
    console.error('[PushService] Failed to unregister subscription:', error)
    return false
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  tenantId: string,
  recipientType: RecipientType,
  recipientId: string,
  preferences: Partial<{
    sessionReminders: boolean
    classReminders: boolean
    invoiceNotifications: boolean
    paymentNotifications: boolean
    atRiskAlerts: boolean
    reminderMinutesBefore: number
    emailEnabled: boolean
    pushEnabled: boolean
  }>
): Promise<boolean> {
  try {
    const where = recipientType === 'user'
      ? { tenantId_userId: { tenantId, userId: recipientId } }
      : { tenantId_userId: { tenantId, userId: recipientId } } // Note: need to adjust schema for clientId

    await prisma.notificationPreference.upsert({
      where,
      create: {
        tenantId,
        userId: recipientType === 'user' ? recipientId : null,
        clientId: recipientType === 'client' ? recipientId : null,
        ...preferences,
      },
      update: preferences,
    })

    return true
  } catch (error) {
    console.error('[PushService] Failed to update notification preferences:', error)
    return false
  }
}
