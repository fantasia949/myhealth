import preProcess from './pre'
import { enrichBiomarkers, enrichTime } from './enrich'
import postProcess from './post'
import { tagKeys } from './post/tag'
import { BioMarker } from '../types/biomarker'

export const tags = tagKeys

export const processTime = (notes: Notes) => {
  return enrichTime(notes)
}

export const processBiomarkers = (entries: Array<Entry>): BioMarker[] => {
  let biomarkers: BioMarker[] = preProcess(entries) as unknown as BioMarker[]
  biomarkers = enrichBiomarkers(biomarkers)
  biomarkers = postProcess(biomarkers as unknown as Entry[]) as unknown as BioMarker[]
  // console.log(output);

  // Optimization: Pre-calculate normalized title to avoid repetitive toLowerCase() calls in filter loops
  // Optimization: Pre-calculate sortTag to avoid repetitive filtering in sort comparator
  // ⚡ Bolt Optimization: Replaced .forEach(), .find(), .includes(), and .map() with a fast standard loop
  // to avoid closure creation, index lookups, and multiple array allocations per biomarker entry.
  for (let i = 0; i < biomarkers.length; i++) {
    const entry = biomarkers[i]
    // Defensive: Ensure entry[3] and entry[3].tag exist to prevent crashes in optimized loops
    if (!entry[3]) {
      entry[3] = { tag: [] } as unknown as BioMarker[3]
    }
    if (!entry[3].tag || entry[3].tag.length === 0) {
      entry[3].tag = ['b-Others']
    }
    const tags = entry[3].tag

    entry[3].normalizedTitle = entry[0].toLowerCase()

    let sortTag = ''
    for (let j = 0; j < tags.length; j++) {
      const tag = tags[j]
      if (tag !== 'a-PhenoAge' && tag !== 'b-Others') {
        sortTag = tag
        break
      }
    }
    entry[3].sortTag = sortTag

    // Optimization: Pre-calculate displayTag and sortKey to avoid repetitive calculations in render loop
    const tagsLen = tags.length
    const processedTags = Array<{ tag: string; displayTag: string; sortKey: string }>(tagsLen)
    for (let j = 0; j < tagsLen; j++) {
      const tag = tags[j]
      const displayTag = tag.substring(tag.indexOf('-') + 1)
      const sortKey = /^\d/.test(tag) ? `1_${tag}` : `2_${tag}`
      processedTags[j] = { tag, displayTag, sortKey }
    }
    entry[3].processedTags = processedTags
  }

  return biomarkers.sort((entry1, entry2) => {
    const tag1 = entry1[3]?.sortTag ?? ''
    const tag2 = entry2[3]?.sortTag ?? ''

    if (tag1 > tag2) {
      return 1
    }
    if (tag1 < tag2) {
      return -1
    }
    return 0
  })
}
