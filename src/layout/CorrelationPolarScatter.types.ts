export interface CorrelationPolarScatterProps {
  target: string
  correlations: [string, number, number][] // [name, pValue, coeff]
  alpha: number
}
