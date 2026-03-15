import { atomWithStorage } from 'jotai/utils'

export const correlationAlphaAtom = atomWithStorage<number>('correlationAlpha', 0.01)
export const correlationAlternativeAtom = atomWithStorage<'two-sided' | 'less' | 'greater'>(
  'correlationAlternative',
  'two-sided',
)
export const correlationMethodAtom = atomWithStorage<'spearman' | 'pearson'>(
  'correlationMethod',
  'spearman',
)
