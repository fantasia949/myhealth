import { BioMarker } from '../types/biomarker'

export interface TableProps {
  onCorrelation: (name: string) => void
  showOrigColumns: boolean
  selected: string[]
  onSelect: (name: string) => void
  showRecords: number
  onClearFilters?: () => void
}

export type DisplayedEntry = {
  name: string
  values: number[]
  visibleValues: number[]
  visibleOptimality: boolean[] | null
  visibleOriginValues: (number | string | null)[] | null | undefined
  unit: string
  extra: BioMarker[3]
  tag: string
  displayTag: string
  sortKey: string
}

export interface TableRowProps {
  entry: DisplayedEntry
  isSelected: boolean
  isExpanded: boolean
  rowId: string
  toggleExpand: (id: string) => void
  onSelect: (name: string) => void
  onCorrelation: (name: string) => void
  setCorrelationBiomarker: (name: string | null) => void
  cellBaseClasses: string[]
  showOrigColumns: boolean
  averageCountValue: string
  visibleLeafColumnsCount: number
  onCellClick: (text: string) => Promise<void>
}
