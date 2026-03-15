import { test, expect } from '@playwright/test'
import { getPhenotypicAge } from '../src/processors/enrich/phenoAge'

test('Verify PhenoAge Coefficients Impact', () => {
  // Base inputs
  const input = {
    albumin: '4.5', // g/dL
    creatinine: '1.0', // mg/dL
    glucose: '90', // mg/dL
    crp: '1.0', // mg/L
    lymph: '30', // %
    mcv: '90', // fL
    rdw: '12', // %
    alp: '70', // U/L
    wbc: '6', // 1000/uL
    age: '40', // years
  }

  const calculate = (overrides: Partial<typeof input>) => {
    const p = { ...input, ...overrides }
    return getPhenotypicAge(
      p.albumin,
      p.creatinine,
      p.glucose,
      p.crp,
      p.lymph,
      p.mcv,
      p.rdw,
      p.alp,
      p.wbc,
      p.age,
    )
  }

  const baseScore = calculate({})
  const rdwPlusOne = calculate({ rdw: '13' })
  const creatPlusOne = calculate({ creatinine: '1.2' })
  const glucPlusOne = calculate({ glucose: '110' })

  const rdwDiff = rdwPlusOne - baseScore
  const creatDiff = creatPlusOne - baseScore
  const glucDiff = glucPlusOne - baseScore

  console.log('RDW Diff:', rdwDiff)
  console.log('Creat Diff:', creatDiff)
  console.log('Gluc Diff:', glucDiff)

  expect(rdwDiff).toBeGreaterThan(creatDiff)
  expect(rdwDiff).toBeGreaterThan(glucDiff)
})
