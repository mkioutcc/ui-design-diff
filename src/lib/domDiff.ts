import type { DomNode, DiffEntry, StyleChange, ChangeType } from '../types/diff'

// Properties to compare for visual diffs
const TRACKED_STYLE_PROPS: string[] = [
  'color', 'background-color', 'background',
  'font-size', 'font-weight', 'font-family', 'font-style',
  'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'border', 'border-radius', 'border-color', 'border-width', 'border-style',
  'top', 'left', 'right', 'bottom',
  'display', 'position', 'flex-direction', 'justify-content', 'align-items',
  'opacity', 'visibility', 'overflow',
  'text-align', 'text-decoration', 'line-height', 'letter-spacing',
  'box-shadow', 'transform',
]

// Build a path string for DOM element identification
function buildPath(el: Element, root: Element): string {
  const parts: string[] = []
  let current: Element | null = el
  while (current && current !== root) {
    const parentEl: Element | null = current.parentElement
    if (!parentEl) break
    const siblings = Array.from(parentEl.children).filter(
      (c: Element) => c.tagName === current!.tagName
    )
    const idx = siblings.indexOf(current)
    const idPart = current.id ? `#${current.id}` : ''
    const classPart = current.className
      ? `.${current.className.trim().replace(/\s+/g, '.')}`
      : ''
    parts.unshift(
      `${current.tagName.toLowerCase()}${idPart}${classPart}:nth(${idx})`
    )
    current = parentEl
  }
  return parts.join(' > ')
}

// Build CSS selector for display purposes (cleaner than path)
function buildSelector(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${el.id}` : ''
  const cls = el.className
    ? `.${el.className.trim().replace(/\s+/g, '.')}`
    : ''
  return `${tag}${id}${cls}` || tag
}

// Serialize DOM element into our DomNode structure
function serializeNode(el: Element, root: Element, depth = 0): DomNode {
  const attrs: Record<string, string> = {}
  for (const attr of Array.from(el.attributes)) {
    attrs[attr.name] = attr.value
  }
  return {
    tagName: el.tagName.toLowerCase(),
    id: el.id,
    className: el.className,
    textContent: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
      ? (el.childNodes[0].textContent || '').trim()
      : '',
    attributes: attrs,
    children: Array.from(el.children).map((c) => serializeNode(c, root, depth + 1)),
    path: buildPath(el, root),
  }
}

// Get computed style snapshot for an element
function getStyleSnapshot(
  el: Element,
  win: Window
): Record<string, string> {
  const cs = win.getComputedStyle(el)
  const result: Record<string, string> = {}
  for (const prop of TRACKED_STYLE_PROPS) {
    result[prop] = cs.getPropertyValue(prop).trim()
  }
  return result
}

// Flatten all elements in document order
function flattenElements(root: Element): Element[] {
  const results: Element[] = []
  const walk = (el: Element) => {
    results.push(el)
    for (const child of Array.from(el.children)) {
      walk(child)
    }
  }
  walk(root)
  return results
}

// Fuzzy match key for element identity
function matchKey(el: Element): string {
  if (el.id) return `id:${el.id}`
  const cls = el.className ? el.className.trim().replace(/\s+/g, '.') : ''
  return `${el.tagName.toLowerCase()}.${cls}`
}

// Compare two style snapshots and return meaningful changes
function compareStyles(
  before: Record<string, string>,
  after: Record<string, string>
): StyleChange[] {
  const changes: StyleChange[] = []
  for (const prop of TRACKED_STYLE_PROPS) {
    const bVal = before[prop] || ''
    const aVal = after[prop] || ''
    if (bVal !== aVal && (bVal || aVal)) {
      changes.push({ property: prop, before: bVal, after: aVal })
    }
  }
  return changes
}

// Main diff function - takes two iframe documents and returns diff entries
export function diffDocuments(
  beforeDoc: Document,
  afterDoc: Document,
  beforeWin: Window,
  afterWin: Window
): DiffEntry[] {
  const results: DiffEntry[] = []

  const beforeBody = beforeDoc.body
  const afterBody = afterDoc.body

  const beforeEls = flattenElements(beforeBody)
  const afterEls = flattenElements(afterBody)

  // Build lookup maps by match key
  const beforeMap = new Map<string, Element[]>()
  for (const el of beforeEls) {
    const key = matchKey(el)
    if (!beforeMap.has(key)) beforeMap.set(key, [])
    beforeMap.get(key)!.push(el)
  }

  const afterMap = new Map<string, Element[]>()
  for (const el of afterEls) {
    const key = matchKey(el)
    if (!afterMap.has(key)) afterMap.set(key, [])
    afterMap.get(key)!.push(el)
  }

  const matchedAfterEls = new Set<Element>()

  // For each before element, find the best matching after element
  for (const beforeEl of beforeEls) {
    const key = matchKey(beforeEl)
    const candidates = afterMap.get(key) || []
    const unmatched = candidates.filter((c) => !matchedAfterEls.has(c))

    if (unmatched.length === 0) {
      // Element was removed
      results.push({
        type: 'removed',
        path: buildPath(beforeEl, beforeBody),
        selector: buildSelector(beforeEl),
        tagName: beforeEl.tagName.toLowerCase(),
        styleChanges: [],
        attributeChanges: [],
        beforeRect: beforeEl.getBoundingClientRect(),
        afterRect: null,
      })
    } else {
      const afterEl = unmatched[0]
      matchedAfterEls.add(afterEl)

      const beforeStyles = getStyleSnapshot(beforeEl, beforeWin)
      const afterStyles = getStyleSnapshot(afterEl, afterWin)
      const styleChanges = compareStyles(beforeStyles, afterStyles)

      // Compare attributes
      const attrChanges: DiffEntry['attributeChanges'] = []
      const allAttrs = new Set([
        ...Array.from(beforeEl.attributes).map((a) => a.name),
        ...Array.from(afterEl.attributes).map((a) => a.name),
      ])
      for (const attr of allAttrs) {
        const bVal = beforeEl.getAttribute(attr) || ''
        const aVal = afterEl.getAttribute(attr) || ''
        if (bVal !== aVal) {
          attrChanges.push({ attr, before: bVal, after: aVal })
        }
      }

      // Compare text
      const beforeText = beforeEl.childNodes.length === 1 && beforeEl.childNodes[0].nodeType === 3
        ? (beforeEl.childNodes[0].textContent || '').trim()
        : ''
      const afterText = afterEl.childNodes.length === 1 && afterEl.childNodes[0].nodeType === 3
        ? (afterEl.childNodes[0].textContent || '').trim()
        : ''
      const textChange = beforeText !== afterText
        ? { before: beforeText, after: afterText }
        : undefined

      const hasChanges = styleChanges.length > 0 || attrChanges.length > 0 || textChange

      const changeType: ChangeType = hasChanges ? 'modified' : 'unchanged'

      if (changeType !== 'unchanged') {
        results.push({
          type: changeType,
          path: buildPath(beforeEl, beforeBody),
          selector: buildSelector(beforeEl),
          tagName: beforeEl.tagName.toLowerCase(),
          styleChanges,
          attributeChanges: attrChanges,
          textChange,
          beforeRect: beforeEl.getBoundingClientRect(),
          afterRect: afterEl.getBoundingClientRect(),
        })
      }
    }
  }

  // Find added elements (those in afterEls not matched)
  for (const afterEl of afterEls) {
    if (!matchedAfterEls.has(afterEl)) {
      results.push({
        type: 'added',
        path: buildPath(afterEl, afterBody),
        selector: buildSelector(afterEl),
        tagName: afterEl.tagName.toLowerCase(),
        styleChanges: [],
        attributeChanges: [],
        beforeRect: null,
        afterRect: afterEl.getBoundingClientRect(),
      })
    }
  }

  return results
}
