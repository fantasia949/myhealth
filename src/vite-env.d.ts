/// <reference types="vite/client" />

type RawEntry = {
  entries: Array<RawSubEntry>
  notes?: Array<string>
}

type RawSubEntry = [name: string, value: string, unit: string, extra?: Record<string, any>]

type Entry = [
  name: string,
  values: Array<string>,
  unit: string,
  extra?: Record<string, any> & {
    hasOrigin?: boolean
    range?: unknown
    originValues?: Array<unknown>
    trend?: number
    originUnit?: string
    isNotOptimal?: (val?: any) => boolean
    description?: string
    getSamples?(testsPerSample: number): Array<string>
    optimality?: boolean[]
    tag?: string[]
    normalizedTitle?: string
    sortTag?: string
    processedTags?: Array<{ tag: string; displayTag: string; sortKey: string }>
  },
]

type Note = {
  date: string
  items: string[]
  supps: string[]
}

type Notes = Record<string, Note>
type NoteItem = Note
