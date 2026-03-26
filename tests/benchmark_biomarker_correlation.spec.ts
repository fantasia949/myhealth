import { test } from '@playwright/test'
import { calculateSpearmanRanked, rankData } from '../src/processors/stats'

test('benchmark biomarker correlation optimized v4', async () => {
  const t0 = performance.now()

  // Create mock data
  const N = 500
  const filteredBiomarkerValues = new Array(N).fill(0).map(() => Math.random() * 100)
  const rankedBiomarker = rankData(filteredBiomarkerValues)

  const supplements = new Array(500).fill(0).map((_, i) => `Supp${i}`)

  const noteValues = new Array(N).fill(0).map(() => ({
    supps: supplements.filter(() => Math.random() > 0.9),
  }))

  const validIndices = new Array(N).fill(0).map((_, i) => i)

  const results = []
  const alpha = 0.05
  const alternative = 'two-sided'

  // OPTIMIZATION v4: Combine generation of filtered vectors with variation check.
  // Instead of querying "does this note have this supplement?", we invert the mapping.
  // We process all valid indices once, populating an array of presence indicators.

  // suppVectors maps a supplement name to its binary presence array [0, 1, 0, ...]
  const suppVectors = new Map<string, number[]>()

  // Optimization: use typed arrays for numbers for faster memory access
  for (const supp of supplements) {
    suppVectors.set(supp, new Array(validIndices.length).fill(0))
  }

  const numValid = validIndices.length
  for (let k = 0; k < numValid; k++) {
    const i = validIndices[k]
    const note = noteValues[i]
    if (note && note.supps) {
      for (let j = 0; j < note.supps.length; j++) {
        const supp = note.supps[j]
        const vector = suppVectors.get(supp)
        if (vector) {
          vector[k] = 1
        }
      }
    }
  }

  for (const suppName of supplements) {
    const filteredSuppVector = suppVectors.get(suppName)
    if (!filteredSuppVector) continue

    // Check variation
    const firstVal = filteredSuppVector[0]
    let hasVariation = false
    for (let k = 1; k < numValid; k++) {
      if (filteredSuppVector[k] !== firstVal) {
        hasVariation = true
        break
      }
    }

    if (!hasVariation) continue

    const rankedSupp = rankData(filteredSuppVector)
    const result: any = calculateSpearmanRanked(rankedBiomarker, rankedSupp, {
      alpha,
      alternative,
    })

    if (result.pcorr !== undefined && !isNaN(result.pcorr) && result.pValue <= 0.1) {
      results.push({ name: suppName, rho: result.pcorr, pValue: result.pValue })
    }
  }

  const t1 = performance.now()
  console.log(`Execution time: ${t1 - t0} milliseconds`)
})
