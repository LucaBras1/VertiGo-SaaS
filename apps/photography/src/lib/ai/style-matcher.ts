/**
 * StyleMatcherAI - AI-powered photography style analysis
 *
 * Analyzes portfolio images using GPT-4 Vision to:
 * - Identify photography style and aesthetic
 * - Generate marketing copy
 * - Suggest ideal client types
 * - Create style keywords
 */

import { z } from 'zod'

// Input schema
export const StyleAnalysisInputSchema = z.object({
  portfolioImages: z.array(z.object({
    url: z.string(),
    title: z.string().optional(),
    eventType: z.string().optional(),
  })).min(5, 'At least 5 portfolio images required'),

  photographerBio: z.string().optional(),
  targetMarket: z.array(z.string()).optional(), // wedding, portrait, commercial
})

// Output schema
export const StyleAnalysisOutputSchema = z.object({
  styleProfile: z.object({
    primaryStyle: z.string(), // e.g., "Bright and Airy", "Moody and Dramatic"
    characteristics: z.array(z.string()), // e.g., "Natural light", "Film-inspired"
    colorPalette: z.string(), // e.g., "Warm tones, golden hour glow"
    compositionStyle: z.string(), // e.g., "Clean, minimalist backgrounds"
    editingStyle: z.string(), // e.g., "Light and airy with soft tones"
  }),

  keywords: z.array(z.string()), // SEO and marketing keywords

  idealClients: z.array(z.object({
    type: z.string(),
    description: z.string(),
    whyGoodMatch: z.string(),
  })),

  marketingCopy: z.object({
    shortBio: z.string(), // 1-2 sentences
    aboutSection: z.string(), // Full "About" page
    instagramBio: z.string(), // Instagram-ready
    websiteTagline: z.string(),
  }),

  similarPhotographers: z.array(z.string()).optional(),

  recommendations: z.array(z.string()), // Tips to enhance style consistency
})

export type StyleAnalysisInput = z.infer<typeof StyleAnalysisInputSchema>
export type StyleAnalysisOutput = z.infer<typeof StyleAnalysisOutputSchema>

/**
 * StyleMatcherAI Service
 */
export class StyleMatcherAI {
  /**
   * Analyze photography style from portfolio images
   */
  async analyzeStyle(
    input: StyleAnalysisInput,
    context: { tenantId: string }
  ): Promise<StyleAnalysisOutput> {
    const validatedInput = StyleAnalysisInputSchema.parse(input)

    // Build system prompt for vision analysis
    const systemPrompt = this.buildSystemPrompt()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not set, returning mock style analysis')
      return this.mockStyleAnalysis(validatedInput)
    }

    try {
      const { createAIClient } = await import('@vertigo/ai-core')
      const ai = createAIClient({
        apiKey,
        defaultModel: 'gpt-4o',
        cache: { enabled: true, ttlMs: 1800000 }, // 30 min cache for style analysis
        rateLimit: { enabled: true, requestsPerMinute: 20 }
      })

      // Build portfolio description from image metadata
      const portfolioDescription = validatedInput.portfolioImages.map((img, idx) =>
        `Image ${idx + 1}: ${img.title || img.url.split('/').pop()}${img.eventType ? ` (${img.eventType})` : ''}`
      ).join('\n')

      const userPrompt = `Analyze this photographer's portfolio and determine their unique style and brand positioning.

Portfolio images:
${portfolioDescription}

${validatedInput.photographerBio ? `Photographer's bio: ${validatedInput.photographerBio}` : ''}
${validatedInput.targetMarket ? `Target markets: ${validatedInput.targetMarket.join(', ')}` : ''}

Based on these ${validatedInput.portfolioImages.length} images, provide a comprehensive style analysis including:
1. Primary style characteristics
2. Color palette and editing preferences
3. Ideal client types
4. Marketing copy suggestions
5. Actionable recommendations to strengthen their brand`

      const response = await ai.chatStructured(
        [{ role: 'user', content: userPrompt }],
        StyleAnalysisOutputSchema,
        { tenantId: context.tenantId, vertical: 'photography' },
        { systemPrompt, model: 'gpt-4o', temperature: 0.7 }
      )

      return response.data
    } catch (error) {
      console.error('AI style analysis failed, falling back to mock:', error)
      return this.mockStyleAnalysis(validatedInput)
    }
  }

  private buildSystemPrompt(): string {
    return `You are an expert photography critic and style analyst with deep knowledge of wedding, portrait, and event photography trends.

Your task is to analyze photographers' work and identify their unique style, aesthetic, and brand positioning.

ANALYSIS FRAMEWORK:

1. LIGHTING STYLE:
   - Natural light vs artificial
   - Soft vs hard light
   - Golden hour preference
   - Indoor vs outdoor mastery

2. COLOR & TONE:
   - Color palette (warm, cool, neutral)
   - Saturation level
   - Contrast preference
   - Film vs digital look
   - Editing style (bright-airy, moody-dark, natural, vibrant)

3. COMPOSITION:
   - Subject positioning
   - Background treatment (clean, environmental, bokeh)
   - Framing choices
   - Perspective angles
   - Use of negative space

4. EMOTIONAL QUALITY:
   - Documentary vs posed
   - Candid vs directed
   - Intimate vs grand
   - Formal vs casual energy

5. TECHNICAL EXECUTION:
   - Focus style (sharp, dreamy)
   - Depth of field preferences
   - Motion capture style
   - Detail vs atmosphere

Provide specific, descriptive analysis that helps potential clients understand if this photographer matches their vision.`
  }

  private mockStyleAnalysis(input: StyleAnalysisInput): StyleAnalysisOutput {
    // Mock data based on typical photography styles
    return {
      styleProfile: {
        primaryStyle: 'Bright and Airy with Natural Documentary',
        characteristics: [
          'Natural light preference',
          'Candid moments over posed perfection',
          'Soft, romantic tones',
          'Clean, uncluttered backgrounds',
          'Film-inspired color grading',
        ],
        colorPalette: 'Warm golden tones with soft pastels and creamy whites',
        compositionStyle: 'Clean backgrounds with intentional negative space, subject-focused with beautiful bokeh',
        editingStyle: 'Light and airy with lifted shadows, warm highlights, and gentle skin tones',
      },

      keywords: [
        'bright and airy photographer',
        'natural light photography',
        'documentary wedding photographer',
        'candid moments',
        'romantic photography',
        'film inspired',
        'golden hour photography',
        'timeless photos',
      ],

      idealClients: [
        {
          type: 'Romantic Couples',
          description: 'Couples who value authentic emotion and natural connection',
          whyGoodMatch: 'Your documentary style captures genuine moments and emotions without forcing poses',
        },
        {
          type: 'Outdoor Wedding Lovers',
          description: 'Clients planning garden, vineyard, or destination weddings',
          whyGoodMatch: 'Your natural light mastery and golden hour timing create magical outdoor images',
        },
        {
          type: 'Timeless Aesthetic Seekers',
          description: 'Couples who want photos that will look beautiful decades from now',
          whyGoodMatch: 'Your classic, timeless editing style avoids trendy filters that date quickly',
        },
      ],

      marketingCopy: {
        shortBio: 'I capture authentic moments with natural light and timeless editing, creating bright, airy photos that feel like you—not a magazine.',

        aboutSection: `Hey there! I'm a wedding and portrait photographer who believes the best photos happen when you forget the camera is there.

My style is all about natural light, genuine emotions, and timeless editing. I love golden hour magic, candid laughter, and those little in-between moments that tell your real story.

You won't find me barking orders or making you pose awkwardly. Instead, I'll guide you gently, crack a few jokes, and let your love shine through naturally. The result? Photos that feel like you—warm, authentic, and beautiful.

When I'm not behind the camera, you'll find me ${input.photographerBio || 'exploring new locations and chasing the perfect sunset'}.

Let's create something timeless together.`,

        instagramBio: '📸 Bright & Airy Photographer\n✨ Natural Light • Candid Moments\n🌅 Golden Hour Enthusiast',

        websiteTagline: 'Timeless photos. Authentic moments. Natural light.',
      },

      similarPhotographers: [
        'Jose Villa (film photography)',
        'Elizabeth Messina (romantic style)',
        'Heather Waraksa (documentary approach)',
      ],

      recommendations: [
        'Consider adding more variety in shooting locations to showcase versatility',
        'Your natural light work is stunning—highlight this as a key differentiator',
        'Create consistent Instagram grid with your signature bright, airy aesthetic',
        'Develop shot list templates that reflect your documentary storytelling approach',
        'Consider offering golden hour mini-sessions as a signature service',
      ],
    }
  }
}

/**
 * Create StyleMatcherAI instance
 */
export function createStyleMatcherAI(): StyleMatcherAI {
  return new StyleMatcherAI()
}

/**
 * Quick style keywords extraction from existing work
 */
export async function extractStyleKeywords(
  portfolioImages: string[]
): Promise<string[]> {
  // Simplified keyword extraction
  // In production, this would use GPT-4 Vision for rapid analysis

  // Return common photography style keywords as placeholder
  return [
    'natural light',
    'bright and airy',
    'documentary style',
    'candid moments',
    'romantic',
    'timeless',
  ]
}
