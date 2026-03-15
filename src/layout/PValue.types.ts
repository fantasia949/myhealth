import { BioMarker } from '../types/biomarker'

export interface PValueProps {
  comparedSourceTarget: BioMarker[] | null
  onClose: () => void
}
