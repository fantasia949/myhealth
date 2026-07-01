export interface DirectionalCorrelationScatterProps {
  target: string
  correlations: [string, number, number][] // [biomarker, pValue, coeff]
  alternative: 'less' | 'greater' | 'two-sided'
}
