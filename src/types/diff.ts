export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged'

export interface StyleChange {
  property: string
  before: string
  after: string
}

export interface DomNode {
  tagName: string
  id: string
  className: string
  textContent: string
  attributes: Record<string, string>
  children: DomNode[]
  path: string
}

export interface DiffEntry {
  type: ChangeType
  path: string
  selector: string
  tagName: string
  styleChanges: StyleChange[]
  attributeChanges: Array<{ attr: string; before: string; after: string }>
  textChange?: { before: string; after: string }
  beforeRect?: DOMRect | null
  afterRect?: DOMRect | null
}

export type ViewMode = 'side-by-side' | 'overlay' | 'change-list'
