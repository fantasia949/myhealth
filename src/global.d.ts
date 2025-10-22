type RawEntry = {
    entries: Array<RawSubEntry>
    notes?: Array<string>
}

type RawSubEntry = [name: string, value: string, unit: string, extra?: Record<string, any>]

type Entry = [name: string, values: Array<string>, unit: string, extra?: Record<string, any>]

type Note = {
  date: string,
  items: string[],
  supps: string[]
}

type Notes = Record<string, Note>
