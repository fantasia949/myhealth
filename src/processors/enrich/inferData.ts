import { getPhenotypicAge, getPhenotypicAge2 } from './phenoAge'
import { labels } from '../../data'
import { BioMarker } from '../../types/biomarker'

type Recipe = [string, string[], (...args: any[]) => string, Partial<BioMarker[3]>?]

const recipes: Recipe[] = [
  [
    'Neutro / Lympho',
    ['SL Neutrophil', 'SL Lymphocyte'],
    (value1, value2) => (value1 / value2).toFixed(1),
  ],
  ['TG / HDL', ['Triglyceride', 'HDL'], (value1, value2) => (value1 / value2).toFixed(1)],
  ['Total Choles / HDL', ['Cholesterol', 'HDL'], (value1, value2) => (value1 / value2).toFixed(1)],
  ['LDL / HDL', ['LDL', 'HDL'], (value1, value2) => (value1 / value2).toFixed(1)],
  ['HOMA-IR', ['Glucose', 'Insulin'], (value1, value2) => ((+value1 * +value2) / 405).toFixed(1)],
  ['NLR', ['% Neutro', '% Lympho'], (value1, value2) => (value1 / value2).toFixed(1)],
  [
    'PhenoAge1',
    ['Albumin', 'Creatinin', 'Glucose', 'CRP-hs', '% Lymphocyte', 'MCV', 'RDW-CV', 'ALP', 'WBC'],
    (a, b, c, d, e, f, g, h, i, age) =>
      getPhenotypicAge(a, b, c, d.replace('<', ''), e, f, g, h, i, age).toFixed(1),
  ],
  [
    'PhenoAge2',
    ['Albumin', 'Creatinin', 'Glucose', 'CRP-hs', '% Lymphocyte', 'MCV', 'RDW-CV', 'ALP', 'WBC'],
    (a, b, c, d, e, f, g, h, i, age) =>
      getPhenotypicAge2(a, b, c, d.replace('<', ''), e, f, g, h, i, age).toFixed(1),
  ],
  ['VLDL', ['Triglyceride'], (triglyceride) => (triglyceride / 5).toFixed(0)],
  ['Age', [], (age) => age.toFixed(1)],
]

const getAge = (label: string) => {
  let year = '20' + label.slice(0, 2)
  const month = label.slice(2, 4)
  let yearNum = +year + parseInt(month) / 12
  const age = yearNum - (1987 + 11 / 12)
  return age
}

export default (entries: BioMarker[]): BioMarker[] => {
  if (entries.length === 0 || entries[0][1].length === 0) return entries

  const periods = entries[0][1].length

  // Optimization: Pre-compute a lookup map of entry values to avoid O(N) Array.find()
  // calls inside the nested periods loop. This reduces complexity from O(R*P*F*N) to O(N + R*P*F).
  const entryMap = new Map<string, number[]>()
  for (let i = 0; i < entries.length; i++) {
    entryMap.set(entries[i][0], entries[i][1])
  }

  const data = recipes.map(([name, fields, func, extra = {}]) => {
    // Look up required field arrays once per recipe
    const fieldArrays = fields.map((field) => entryMap.get(field))

    // If any required field is entirely missing, all calculated values for this recipe will be null
    const hasMissingField = fieldArrays.some((arr) => arr === undefined)
    const numFields = fieldArrays.length

    // Optimization: Avoid chaining Array.from({ length }).map() and inner array.map().some()
    // inside hot loops to reduce multiple array allocations and closure overheads per period.
    const values = Array<string | null>(periods)
    if (hasMissingField) {
      for (let i = 0; i < periods; i++) {
        values[i] = null
      }
    } else {
      for (let i = 0; i < periods; i++) {
        let missing = false
        const fieldValues = Array<number>(numFields)
        for (let j = 0; j < numFields; j++) {
          const v = fieldArrays[j]![i]
          if (!v) {
            missing = true
            break
          }
          fieldValues[j] = v
        }

        if (missing) {
          values[i] = null
        } else {
          values[i] = func(...fieldValues, getAge(labels[i]))
        }
      }
    }

    if (!(extra as any).originValues) {
      ;(extra as any).originValues = Array<any>(periods)
    }
    ;(extra as any).inferred = true
    return [name, values, null, extra] as any
  })

  return [...entries, ...data]
}
