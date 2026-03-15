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
  unit: string
  extra: BioMarker[3]
  tag: string
  displayTag: string
  sortKey: string
}
