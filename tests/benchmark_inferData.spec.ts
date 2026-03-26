import { test, expect } from '@playwright/test'

// Mocking the required parts
const labels = Array.from({ length: 100 }, (_, i) => `${String(i % 100).padStart(2, '0')}01`)
const getAge = (label: string) => {
  let year = '20' + label.slice(0, 2)
  const month = label.slice(2, 4)
  let yearNum = +year + parseInt(month) / 12
  const age = yearNum - (1987 + 11 / 12)
  return age
}

type BioMarker = [string, number[], string, any]
type Recipe = [string, string[], (...args: any[]) => string, Partial<BioMarker[3]>?]

const recipes: Recipe[] = [
  [
    'Neutro / Lympho',
    ['SL Neutrophil', 'SL Lymphocyte'],
    (value1, value2) => (value1 / value2).toFixed(1),
  ],
  ['TG / HDL', ['Triglyceride', 'HDL'], (value1, value2) => (value1 / value2).toFixed(1)],
  ['Total Choles / HDL', ['Cholesterol', 'HDL'], (value1, value2) => (value1 / value2).toFixed(1)],
  [
    'PhenoAge1',
    ['Albumin', 'Creatinin', 'Glucose', 'CRP-hs', '% Lymphocyte', 'MCV', 'RDW-CV', 'ALP', 'WBC'],
    () => '1.0',
  ],
  [
    'PhenoAge2',
    ['Albumin', 'Creatinin', 'Glucose', 'CRP-hs', '% Lymphocyte', 'MCV', 'RDW-CV', 'ALP', 'WBC'],
    () => '1.0',
  ],
  ['VLDL', ['Triglyceride'], (triglyceride) => (triglyceride / 5).toFixed(0)],
  ['Age', [], (age) => age.toFixed(1)],
]

test('benchmark inferData optimization', async () => {
  const periods = 100
  const entries: BioMarker[] = Array.from({ length: 100 }, (_, i) => {
    let name = `Biomarker${i}`
    // Assign some required names
    if (i === 0) name = 'SL Neutrophil'
    if (i === 1) name = 'SL Lymphocyte'
    if (i === 2) name = 'Triglyceride'
    if (i === 3) name = 'HDL'
    if (i === 4) name = 'Cholesterol'
    if (i === 5) name = 'Albumin'
    if (i === 6) name = 'Creatinin'
    if (i === 7) name = 'Glucose'
    if (i === 8) name = 'CRP-hs'
    if (i === 9) name = '% Lymphocyte'
    if (i === 10) name = 'MCV'
    if (i === 11) name = 'RDW-CV'
    if (i === 12) name = 'ALP'
    if (i === 13) name = 'WBC'

    return [
      name,
      Array.from({ length: periods }, () => Math.random() * 100),
      'unit',
      {},
    ] as BioMarker
  })

  // Baseline
  const start1 = performance.now()
    for (let iter = 0; iter < 100; iter++) {
    recipes.map(([name, fields, func, extra = {}]) => {
      const values = Array.from({ length: periods }).map((_v, i) => {
        const fieldValues = fields.map((field) => entries.find(([n]) => n === field)?.[1][i])

        if (fieldValues.some((v) => !v)) {
          return null
        }
        return func(...fieldValues, getAge(labels[i]))
      })
      if (!(extra as any).originValues) {
        ;(extra as any).originValues = Array.from({ length: periods })
      }
      ;(extra as any).inferred = true
      return [name, values, null, extra] as any
    })
  }
  const end1 = performance.now()
  const baselineDuration = end1 - start1

  // Optimized
  const start2 = performance.now()
    for (let iter = 0; iter < 100; iter++) {
    // Build a map of entry vectors ONCE per iter instead of calling find O(M * N) times
    const entryMap = new Map<string, number[]>()
    for (let i = 0; i < entries.length; i++) {
      entryMap.set(entries[i][0], entries[i][1])
    }

    recipes.map(([name, fields, func, extra = {}]) => {
      // Look up vectors once per field
      const fieldArrays = fields.map((field) => entryMap.get(field))

      // Optimization check: if a required field is missing, all periods will be null
      const hasMissingField = fieldArrays.some((arr) => arr === undefined)

      const values = Array.from({ length: periods }).map((_v, i) => {
        if (hasMissingField) return null

        const fieldValues = fieldArrays.map((arr) => arr![i])
        if (fieldValues.some((v) => !v)) return null

        return func(...fieldValues, getAge(labels[i]))
      })

      if (!(extra as any).originValues) {
        ;(extra as any).originValues = Array.from({ length: periods })
      }
      ;(extra as any).inferred = true
      return [name, values, null, extra] as any
    })
  }
  const end2 = performance.now()
  const optimizedDuration = end2 - start2

  console.log(`Baseline Duration: ${baselineDuration.toFixed(2)} ms`)
  console.log(`Optimized Duration: ${optimizedDuration.toFixed(2)} ms`)
  console.log(`Speedup: ${(baselineDuration / optimizedDuration).toFixed(2)}x`)

  expect(optimizedDuration).toBeLessThan(baselineDuration)
})
