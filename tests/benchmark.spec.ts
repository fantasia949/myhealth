import { test, expect } from '@playwright/test'
import { calculatePearson } from '../src/processors/stats'

test('compare logic edge cases', async () => {
  let x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  let y = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  let res1 = calculatePearson(x, y, { alpha: 0.05, alternative: 'two-sided' })
  expect(res1.pValue).toBeCloseTo(0, 6)
  expect(res1.pcorr).toBeCloseTo(1, 6)

  x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  y = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

  res1 = calculatePearson(x, y, { alpha: 0.05, alternative: 'two-sided' })

  expect(res1.pValue).toBeCloseTo(0, 6)
  expect(res1.pcorr).toBeCloseTo(-1, 6)
})
