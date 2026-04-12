export interface BiomarkerCorrelationProps {
  biomarkerId: string | null
  onClose: () => void
}

export interface CorrelationResult {
  name: string
  rho: number
  pValue: number
  count: number
}
