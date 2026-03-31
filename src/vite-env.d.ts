/// <reference types="vite/client" />

type RawEntry = {
  entries: Array<RawSubEntry>
  notes?: Array<string>
}

type RawSubEntry = [name: string, value: string, unit: string, extra?: Record<string, unknown>]

type Entry = [
  name: string,
  values: Array<string>,
  unit: string,
  extra?: Record<string, unknown> & {
    hasOrigin?: boolean
    range?: string
    originValues?: Array<string | number | null>
    trend?: number
    originUnit?: string
    isNotOptimal?: (val: number) => boolean
    description?: string
    getSamples?(testsPerSample: number): Array<string>
    optimality?: boolean[]
    tag?: string[]
    normalizedTitle?: string
    sortTag?: string
    processedTags?: Array<{ tag: string; displayTag: string; sortKey: string }>
  },
]

type NoteRecord = {
  date: string
  items: string[]
  supps: string[]
}

type Notes = Record<string, NoteRecord>
type NoteItem = NoteRecord
