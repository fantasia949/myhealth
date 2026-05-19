import { CorrelationResult } from './BiomarkerCorrelation.types'

export interface BumpChartProps {
  targetBiomarker: string
  correlations: CorrelationResult[]
  noteValues: NoteItem[]
}
