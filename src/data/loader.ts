import mergeEntries from '../processors/merge'
import data from './aggregated'

const addLabels = ['251015', '251120', '251228', '260129', '260305', '260411']

export const labels = [...data.map((item) => item.time), ...addLabels]

// ⚡ Bolt Optimization: Pre-calculate formatted date strings once at load time.
// This prevents redundant string manipulations and object allocations inside
// chart component render loops or useMemo hooks, reducing garbage collection overhead.
export const formattedLabels = labels.map((label) => {
  if (!label || label.length < 6) return label
  return `20${label.slice(0, 2)}/${label.slice(2, 4)}/${label.slice(4, 6)}`
})

const mergeNotes = (inputs: Array<RawEntry>): Notes =>
  Object.fromEntries(
    inputs.map((entry, index) => [
      labels[index],
      { date: labels[index], supps: [], items: entry.notes || [] },
    ]),
  )

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
