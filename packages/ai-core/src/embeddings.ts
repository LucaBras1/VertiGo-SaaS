/**
 * Embedding Service - For RAG and semantic search
 */

import OpenAI from 'openai'
import type { AIRequestContext } from './types'

export interface EmbeddingConfig {
  apiKey: string
  model?: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002'
  dimensions?: number
}

export interface EmbeddingResult {
  embedding: number[]
  tokens: number
}

export class EmbeddingService {
  private openai: OpenAI
  private model: string
  private dimensions?: number

  constructor(config: EmbeddingConfig) {
    this.openai = new OpenAI({ apiKey: config.apiKey })
    this.model = config.model ?? 'text-embedding-3-small'
    this.dimensions = config.dimensions
  }

  /**
   * Generate embedding for a single text
   */
  async embed(text: string, _context?: AIRequestContext): Promise<EmbeddingResult> {
    const response = await this.openai.embeddings.create({
      model: this.model,
      input: text,
      dimensions: this.dimensions,
    })

    return {
      embedding: response.data[0].embedding,
      tokens: response.usage.total_tokens,
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embedBatch(
    texts: string[],
    _context?: AIRequestContext
  ): Promise<EmbeddingResult[]> {
    const response = await this.openai.embeddings.create({
      model: this.model,
      input: texts,
      dimensions: this.dimensions,
    })

    return response.data.map((item) => ({
      embedding: item.embedding,
      tokens: Math.floor(response.usage.total_tokens / texts.length),
    }))
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Find most similar items from a list of embeddings
   */
  findSimilar(
    queryEmbedding: number[],
    candidates: Array<{ id: string; embedding: number[] }>,
    topK: number = 5
  ): Array<{ id: string; similarity: number }> {
    const scored = candidates.map(candidate => ({
      id: candidate.id,
      similarity: this.cosineSimilarity(queryEmbedding, candidate.embedding),
    }))

    scored.sort((a, b) => b.similarity - a.similarity)

    return scored.slice(0, topK)
  }
}

export function createEmbeddingService(config: EmbeddingConfig): EmbeddingService {
  return new EmbeddingService(config)
}
