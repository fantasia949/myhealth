const { performance } = require('perf_hooks');

const labels = Array.from({ length: 100 }, (_, i) => `${String(i % 100).padStart(2, '0')}01`);
const getAge = (label) => {
  let year = '20' + label.slice(0, 2)
  const month = label.slice(2, 4)
  let yearNum = +year + parseInt(month) / 12
  const age = yearNum - (1987 + 11 / 12)
  return age
}

const recipes = [
  ['Neutro / Lympho', ['SL Neutrophil', 'SL Lymphocyte'], (value1, value2) => (value1 / value2).toFixed(1)],
  ['TG / HDL', ['Triglyceride', 'HDL'], (value1, value2) => (value1 / value2).toFixed(1)],
  ['Total Choles / HDL', ['Cholesterol', 'HDL'], (value1, value2) => (value1 / value2).toFixed(1)],
  ['PhenoAge1', ['Albumin', 'Creatinin', 'Glucose', 'CRP-hs', '% Lymphocyte', 'MCV', 'RDW-CV', 'ALP', 'WBC'], () => '1.0'],
  ['PhenoAge2', ['Albumin', 'Creatinin', 'Glucose', 'CRP-hs', '% Lymphocyte', 'MCV', 'RDW-CV', 'ALP', 'WBC'], () => '1.0'],
  ['VLDL', ['Triglyceride'], (triglyceride) => (triglyceride / 5).toFixed(0)],
  ['Age', [], (age) => age.toFixed(1)],
]

const periods = 100
const entries = Array.from({ length: 100 }, (_, i) => {
  let name = `Biomarker${i}`
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
    {}
  ]
})


// Currently optimized
const start2 = performance.now()
let result2;
for (let iter = 0; iter < 1000; iter++) {
  const entryMap = new Map()
  for (let i = 0; i < entries.length; i++) {
    entryMap.set(entries[i][0], entries[i][1])
  }

  result2 = recipes.map(([name, fields, func, extra = {}]) => {
    const fieldArrays = fields.map(field => entryMap.get(field))
    const hasMissingField = fieldArrays.some(arr => arr === undefined)

    const values = Array.from({ length: periods }).map((_v, i) => {
      if (hasMissingField) return null

      const fieldValues = fieldArrays.map(arr => arr[i])
      if (fieldValues.some(v => !v)) return null

      return func(...fieldValues, getAge(labels[i]))
    })

    if (!extra.originValues) {
      extra.originValues = Array.from({ length: periods })
    }
    extra.inferred = true
    return [name, values, null, extra]
  })
}
const end2 = performance.now()
console.log(`Current Optimized Duration: ${end2 - start2} ms`)


// New optimized
const start3 = performance.now()
let result3;
for (let iter = 0; iter < 1000; iter++) {
  const entryMap = new Map()
  for (let i = 0; i < entries.length; i++) {
    entryMap.set(entries[i][0], entries[i][1])
  }

  result3 = recipes.map(([name, fields, func, extra = {}]) => {
    const fieldArrays = fields.map(field => entryMap.get(field))
    const hasMissingField = fieldArrays.some(arr => arr === undefined)
    const numFields = fieldArrays.length;

    const values = new Array(periods);

    if (hasMissingField) {
      for (let i = 0; i < periods; i++) values[i] = null;
    } else {
      for (let i = 0; i < periods; i++) {
        let missing = false;
        const fieldValues = new Array(numFields);
        for (let j = 0; j < numFields; j++) {
          const v = fieldArrays[j][i];
          if (!v) { missing = true; break; }
          fieldValues[j] = v;
        }
        if (missing) {
          values[i] = null;
        } else {
          values[i] = func(...fieldValues, getAge(labels[i]))
        }
      }
    }

    if (!extra.originValues) {
      extra.originValues = Array.from({ length: periods })
    }
    extra.inferred = true
    return [name, values, null, extra]
  })
}
const end3 = performance.now()
console.log(`New Optimized Duration: ${end3 - start3} ms`)
