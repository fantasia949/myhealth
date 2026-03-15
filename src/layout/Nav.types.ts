import React from 'react'

export type NavProps = {
  selected: string[]
  onSelect: (name: string) => void
  chartType: string
  onChartTypeChange: (type: string) => void
  onClearSelection: () => void
  filterText: string
  filterTag: string | null
  showOrigColumns: boolean
  showRecords: number
  onShowRecordsChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFilterByTag: (e: React.MouseEvent<HTMLElement>) => void
  onOriginValueToggle: (e: React.ChangeEvent<HTMLInputElement>) => void
  onVisualize: () => void
  onPValue: () => void
}
