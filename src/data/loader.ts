import mergeEntries from '../processors/merge'
import data from './aggregated'

const addLabels = ['251015', '251120', '251228', '260129', '260305', '260411', '260602', '260703']

// Optimization: Pre-allocate the labels array and use a simple for-loop
// instead of array spread and array.map to eliminate garbage collection overhead.
export const labels = Array<string>(data.length + addLabels.length)
for (let i = 0; i < data.length; i++) {
  labels[i] = data[i].time as string
}
for (let i = 0; i < addLabels.length; i++) {
  labels[data.length + i] = addLabels[i]
}

// ⚡ Bolt Optimization: Pre-calculate formatted date strings once at load time.
// This prevents redundant string manipulations and object allocations inside
// chart component render loops or useMemo hooks, reducing garbage collection overhead.
// Optimization: Use a pre-allocated array and a simple for-loop instead of array.map.
export const formattedLabels = Array<string>(labels.length)
for (let i = 0; i < labels.length; i++) {
  const label = labels[i]
  if (!label || label.length < 6) {
    formattedLabels[i] = label
  } else {
    formattedLabels[i] = `20${label.slice(0, 2)}/${label.slice(2, 4)}/${label.slice(4, 6)}`
  }
}

const mergeNotes = (inputs: Array<RawEntry>): Notes => {
  // Optimization: Replace Object.fromEntries(inputs.map(...)) with a traditional
  // for-loop to eliminate intermediate array allocations and closure creation.
  const notes: Notes = {}
  const len = inputs.length
  for (let i = 0; i < len; i++) {
    const label = labels[i]
    notes[label] = { date: label, supps: [], items: inputs[i].notes || [] }
  }
  return notes
}

const loadNewData = (): Promise<RawEntry[]> =>
  Promise.all(
    addLabels.map((label) =>
      import(`./20${label}.ts`).then((module) => {
        const record: RawEntry & { time?: string } = Array.isArray(module.default.entries)
          ? module.default
          : { entries: module.default }
        record.time = label
        return record
      }),
    ),
  )

export const loadData = async () => {
  const newData: Array<RawEntry> = [
    ...(data as unknown as Array<RawEntry>),
    ...(await loadNewData()),
  ]
  return [mergeEntries(newData), mergeNotes(newData)] as const
}

// https://www.scymed.com/en/smnxps/psxkc035_c.htm
