export interface SupplementCorrelationProps {
  supplementName: string | null
  onClose: () => void
}

export interface SupplementCorrelationResult {
  name: string
  rho: number
  pValue: number
  count: number
}
