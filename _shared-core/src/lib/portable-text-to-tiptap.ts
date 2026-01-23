/**
 * Portable Text to Tiptap JSON Converter
 *
 * Converts Sanity's Portable Text format to Tiptap's JSON format
 * for seamless migration from Sanity CMS to custom database
 */

interface PortableTextBlock {
  _type: string
  _key?: string
  style?: string
  markDefs?: Array<{
    _key: string
    _type: string
    [key: string]: any
  }>
  children?: Array<{
    _type: string
    _key?: string
    text?: string
    marks?: string[]
    [key: string]: any
  }>
  [key: string]: any
}

interface TiptapNode {
  type: string
  attrs?: Record<string, any>
  content?: TiptapNode[]
  marks?: Array<{
    type: string
    attrs?: Record<string, any>
  }>
  text?: string
}

interface TiptapDocument {
  type: 'doc'
  content: TiptapNode[]
}

/**
 * Convert Portable Text marks to Tiptap marks
 */
function convertMarks(
  marks: string[] | undefined,
  markDefs: PortableTextBlock['markDefs']
): TiptapNode['marks'] {
  if (!marks || marks.length === 0) return undefined

  return marks.map((mark) => {
    // Simple marks (strong, em, code, etc.)
    if (mark === 'strong') return { type: 'bold' }
    if (mark === 'em') return { type: 'italic' }
    if (mark === 'code') return { type: 'code' }
    if (mark === 'underline') return { type: 'underline' }
    if (mark === 'strike-through') return { type: 'strike' }

    // Complex marks with definitions (links, etc.)
    const markDef = markDefs?.find((def) => def._key === mark)
    if (markDef) {
      if (markDef._type === 'link') {
        return {
          type: 'link',
          attrs: {
            href: markDef.href,
            target: markDef.blank ? '_blank' : undefined,
          },
        }
      }
    }

    // Unknown mark - return as-is
    return { type: mark }
  })
}

/**
 * Convert Portable Text block style to Tiptap node type
 */
function getNodeType(style: string | undefined): string {
  if (!style || style === 'normal') return 'paragraph'
  if (style === 'h1') return 'heading'
  if (style === 'h2') return 'heading'
  if (style === 'h3') return 'heading'
  if (style === 'h4') return 'heading'
  if (style === 'h5') return 'heading'
  if (style === 'h6') return 'heading'
  if (style === 'blockquote') return 'blockquote'
  return 'paragraph'
}

/**
 * Get heading level from style
 */
function getHeadingLevel(style: string | undefined): number | undefined {
  if (!style) return undefined
  if (style === 'h1') return 1
  if (style === 'h2') return 2
  if (style === 'h3') return 3
  if (style === 'h4') return 4
  if (style === 'h5') return 5
  if (style === 'h6') return 6
  return undefined
}

/**
 * Convert Portable Text list to Tiptap list
 */
function convertList(
  blocks: PortableTextBlock[],
  startIndex: number
): { node: TiptapNode; endIndex: number } {
  const firstBlock = blocks[startIndex]
  const listType = firstBlock.listItem === 'bullet' ? 'bulletList' : 'orderedList'

  const items: TiptapNode[] = []
  let i = startIndex

  // Collect all consecutive list items of the same type
  while (
    i < blocks.length &&
    blocks[i]._type === 'block' &&
    blocks[i].listItem === firstBlock.listItem
  ) {
    const block = blocks[i]
    const content: TiptapNode[] = []

    if (block.children) {
      for (const child of block.children) {
        if (child._type === 'span' && child.text !== undefined) {
          content.push({
            type: 'text',
            text: child.text,
            marks: convertMarks(child.marks, block.markDefs),
          })
        }
      }
    }

    items.push({
      type: 'listItem',
      content: [
        {
          type: 'paragraph',
          content: content.length > 0 ? content : undefined,
        },
      ],
    })

    i++
  }

  return {
    node: {
      type: listType,
      content: items,
    },
    endIndex: i - 1,
  }
}

/**
 * Main conversion function: Portable Text → Tiptap JSON
 */
export function portableTextToTiptap(
  portableText: PortableTextBlock[] | null | undefined
): TiptapDocument | null {
  if (!portableText || portableText.length === 0) {
    return null
  }

  const content: TiptapNode[] = []
  let i = 0

  while (i < portableText.length) {
    const block = portableText[i]

    // Handle block type
    if (block._type === 'block') {
      // Handle lists
      if (block.listItem) {
        const { node, endIndex } = convertList(portableText, i)
        content.push(node)
        i = endIndex + 1
        continue
      }

      // Handle regular blocks (paragraph, heading, blockquote)
      const nodeType = getNodeType(block.style)
      const children: TiptapNode[] = []

      if (block.children) {
        for (const child of block.children) {
          if (child._type === 'span' && child.text !== undefined) {
            children.push({
              type: 'text',
              text: child.text,
              marks: convertMarks(child.marks, block.markDefs),
            })
          }
        }
      }

      const node: TiptapNode = {
        type: nodeType,
        content: children.length > 0 ? children : undefined,
      }

      // Add heading level attribute
      const headingLevel = getHeadingLevel(block.style)
      if (headingLevel) {
        node.attrs = { level: headingLevel }
      }

      content.push(node)
    }

    // Handle image blocks (if needed in the future)
    else if (block._type === 'image') {
      // For now, we skip images as they'll be handled separately
      // in the migration script
      console.warn('Image blocks in Portable Text are not supported yet')
    }

    // Skip unknown block types
    else {
      console.warn(`Unknown Portable Text block type: ${block._type}`)
    }

    i++
  }

  return {
    type: 'doc',
    content,
  }
}

/**
 * Helper: Convert and stringify in one go
 */
export function portableTextToTiptapJSON(
  portableText: PortableTextBlock[] | null | undefined
): string | null {
  const tiptap = portableTextToTiptap(portableText)
  return tiptap ? JSON.stringify(tiptap) : null
}
