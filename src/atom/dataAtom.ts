import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { loadData } from '../data'
import { processBiomarkers, processTime } from '../processors'
import { rankData } from '../processors/stats'
import { BioMarker } from '../types/biomarker'

const sourceAtom = atom(() => loadData())

export const getBioMarkersAtom = atom((get) =>
  get(sourceAtom).then(([data]) => processBiomarkers(data)),
)

export const notesAtom = atom((get) => get(sourceAtom).then(([_, notes]) => processTime(notes)))

export const noteValuesAtom = atom(async (get) => {
  const notes = await get(notesAtom)
  return Object.values(notes)
})

import { loadable } from 'jotai/utils'

const loadableBioMarkersAtom = loadable(getBioMarkersAtom)

export const dataAtom = atom<BioMarker[]>((get) => {
  const loadableBioMarkers = get(loadableBioMarkersAtom)
  if (loadableBioMarkers.state === 'hasData') {
    return loadableBioMarkers.data
  }
  return []
})

export const dataMapAtom = atom((get) => {
  const data = get(dataAtom)
  const map = new Map<string, BioMarker>()
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    map.set(item[0], item)
  }
  return map
})

export const rankedDataMapAtom = atom((get) => {
  const data = get(dataAtom)
  const map = new Map<string, Float64Array>()

  if (data.length === 0) return map

  // Optimization: Pre-allocate a single shared Float64Array buffer instead of creating
  // a new one for every biomarker. Using .subarray() creates a zero-copy view, eliminating
  // O(Biomarkers * N) array allocations and garbage collection overhead during data updates.
  const maxLen = data[0][1].length
  const sharedBuffer = new Float64Array(maxLen)

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const rawValues = item[1]
    const len = rawValues.length

    // Reset buffer up to len to avoid stale data from previous iteration
    sharedBuffer.fill(0, 0, len)

    for (let j = 0; j < len; j++) {
      const v = rawValues[j]
      if (v !== null && v !== undefined && (v as any) !== '') {
        sharedBuffer[j] = +v
      }
    }

    // Pass a zero-copy slice of the full length array to retain date alignment
    map.set(item[0], rankData(sharedBuffer.subarray(0, len)))
  }
  return map
})

export const filterTextAtom = atom('')
export const tagAtom = atom<string | null>(null)

export const visibleDataAtom = atom((get) => {
  let data = get(dataAtom)
  const filterText = get(filterTextAtom)
  const tag = get(tagAtom)
  if (data && (filterText || tag)) {
    const lowerFilterText = filterText ? filterText.toLowerCase() : ''
    const words = lowerFilterText.split(' ').filter(Boolean)
    const hasFilterText = !!filterText

    // Optimization: Hoist invariant check outside of filter loop.
    if (hasFilterText && words.length === 0) {
      return []
    }

    // Optimization: Replace Array.filter and Array.some with traditional for-loops
    // to avoid closure creation and callback overhead during rapid search keystrokes.
    const filteredData: typeof data = []
    const wordsLen = words.length
    for (let i = 0; i < data.length; i++) {
      const entry = data[i]
      const extra = entry[3]

      if (tag && !extra.tag.includes(tag)) {
        continue
      }

      if (!hasFilterText) {
        filteredData.push(entry)
        continue
      }

      const title = extra.normalizedTitle!
      let matched = false
      for (let j = 0; j < wordsLen; j++) {
        if (title.includes(words[j])) {
          matched = true
          break
        }
      }

      if (matched) {
        filteredData.push(entry)
      }
    }
    data = filteredData
  }
  return data
})

export const aiKeyAtom = atomWithStorage<string | null>('key', null)
export const aiModelAtom = atomWithStorage<string>('model', 'gemini-3-flash-preview')
export const gistTokenAtom = atomWithStorage<string | null>('gistToken', null)

export const nonInferredDataAtom = atom((get) => {
  const data = get(dataAtom)
  // Optimization: Replace Array.filter with a traditional for-loop to avoid closure creation and garbage collection overhead in derived Jotai atoms.
  const filteredData: typeof data = []
  for (let i = 0; i < data.length; i++) {
    if (!data[i][3]?.inferred) {
      filteredData.push(data[i])
    }
  }
  return filteredData
})
