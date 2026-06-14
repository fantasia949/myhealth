import React from 'react'

export type NavProps = {
  selected: string[]
  onSelect: (name: string) => void
  chartType: string
  onChartTypeChange: (type: string) => void
  onClearSelection: () => void
  filterText: string
  filterTag: string | null
  showRecords: number
  onShowRecordsChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFilterByTag: (e: React.MouseEvent<HTMLElement>) => void
  onVisualize: () => void
  onPValue: () => void
  onSupplementCorrelation: (name: string) => void
  onOpenClustering?: () => void
  isMatrixViewOpen: boolean
  onToggleMatrixView: () => void
  isNetworkViewOpen: boolean
  onToggleNetworkView: () => void
}
