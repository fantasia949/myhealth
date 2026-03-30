export type BioMarker = [
  string,
  number[],
  string,
  {
    tag: string[]
    inferred?: boolean
    originValues?: (string | number | null)[]
    hasOrigin?: boolean
    range?: string
    description?: string
    isNotOptimal: (value: number) => boolean
    getSamples: (num: number, count?: number) => string[]
    originUnit?: string
    normalizedTitle?: string
    sortTag?: string
    processedTags?: { tag: string; displayTag: string; sortKey: string }[]
    optimality: boolean[]
  },
]
