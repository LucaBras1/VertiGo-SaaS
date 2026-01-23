/**
 * Usage Tracker - Track AI API usage per tenant for billing and analytics
 */

import type { AIModel, TenantId, Vertical } from './types'

export interface UsageRecord {
  tenantId: TenantId
  vertical: Vertical
  model: AIModel
  promptTokens: number
  completionTokens: number
  totalTokens: number
  timestamp: Date
}

export interface UsageStats {
  totalRequests: number
  totalTokens: number
  promptTokens: number
  completionTokens: number
  estimatedCostUSD: number
  byModel: Record<AIModel, {
    requests: number
    tokens: number
    costUSD: number
  }>
  periodStart: Date
  periodEnd: Date
}

// Approximate costs per 1M tokens (as of 2024)
const MODEL_COSTS: Record<AIModel, { input: number; output: number }> = {
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
}

export class UsageTracker {
  private records: UsageRecord[] = []

  track(record: UsageRecord): void {
    this.records.push(record)
  }

  getStats(tenantId: TenantId, periodDays: number = 30): UsageStats {
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - periodDays)
    const periodEnd = new Date()

    const tenantRecords = this.records.filter(
      r => r.tenantId === tenantId && r.timestamp >= periodStart
    )

    const byModel: UsageStats['byModel'] = {} as UsageStats['byModel']

    let totalTokens = 0
    let promptTokens = 0
    let completionTokens = 0
    let estimatedCostUSD = 0

    for (const record of tenantRecords) {
      totalTokens += record.totalTokens
      promptTokens += record.promptTokens
      completionTokens += record.completionTokens

      const costs = MODEL_COSTS[record.model]
      const recordCost =
        (record.promptTokens / 1_000_000) * costs.input +
        (record.completionTokens / 1_000_000) * costs.output

      estimatedCostUSD += recordCost

      if (!byModel[record.model]) {
        byModel[record.model] = { requests: 0, tokens: 0, costUSD: 0 }
      }
      byModel[record.model].requests += 1
      byModel[record.model].tokens += record.totalTokens
      byModel[record.model].costUSD += recordCost
    }

    return {
      totalRequests: tenantRecords.length,
      totalTokens,
      promptTokens,
      completionTokens,
      estimatedCostUSD: Math.round(estimatedCostUSD * 100) / 100,
      byModel,
      periodStart,
      periodEnd,
    }
  }

  getGlobalStats(periodDays: number = 30): Record<Vertical, UsageStats> {
    const verticals: Vertical[] = [
      'photography', 'musicians', 'fitness', 'events',
      'performing_arts', 'team_building', 'kids_entertainment'
    ]

    const stats: Record<string, UsageStats> = {}

    for (const vertical of verticals) {
      const periodStart = new Date()
      periodStart.setDate(periodStart.getDate() - periodDays)

      const verticalRecords = this.records.filter(
        r => r.vertical === vertical && r.timestamp >= periodStart
      )

      // Aggregate by unique tenants
      const tenantIds = [...new Set(verticalRecords.map(r => r.tenantId))]
      if (tenantIds.length > 0) {
        stats[vertical] = this.getStats(tenantIds[0], periodDays)
      }
    }

    return stats as Record<Vertical, UsageStats>
  }

  clearOldRecords(olderThanDays: number = 90): number {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - olderThanDays)

    const originalLength = this.records.length
    this.records = this.records.filter(r => r.timestamp >= cutoff)

    return originalLength - this.records.length
  }
}

export function createUsageTracker(): UsageTracker {
  return new UsageTracker()
}
