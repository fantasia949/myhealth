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
  // Optimization: Replacing Array.forEach and Array.map with a traditional for-loop
  // and a pre-allocated Float64Array to avoid object allocation and garbage collection
  // overhead inside derived atoms. This also provides a fast zero-copy path for rankData.
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const rawValues = item[1]
    const len = rawValues.length
    const values = new Float64Array(len)
    for (let j = 0; j < len; j++) {
      const v = rawValues[j]
      if (v) {
        values[j] = +v
      }
    }
    map.set(item[0], rankData(values))
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
