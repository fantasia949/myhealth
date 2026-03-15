import { test, expect } from '@playwright/test'
import { rankData, calculateSpearmanRanked } from '../src/processors/stats'

function rankBinaryDataArray(arr: number[]): Float64Array {
  const n = arr.length
  let count0 = 0
  for (let i = 0; i < n; i++) {
    if (arr[i] === 0) count0++
  }
  const count1 = n - count0

  const rank0 = (count0 + 1) / 2
  const rank1 = count0 + (count1 + 1) / 2

  const ranks = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    ranks[i] = arr[i] === 0 ? rank0 : rank1
  }
  return ranks
}

function rankBinaryDataInt8(arr: Int8Array): Float64Array {
  const n = arr.length
  let count0 = 0
  for (let i = 0; i < n; i++) {
    if (arr[i] === 0) count0++
  }
  const count1 = n - count0

  const rank0 = (count0 + 1) / 2
  const rank1 = count0 + (count1 + 1) / 2

  const ranks = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    ranks[i] = arr[i] === 0 ? rank0 : rank1
  }
  return ranks
}

test('spearman rank int8 vector optimization benchmark', async () => {
  const M = 1000
  const N = 100

  const uniqueSupplements = new Set<string>()
  for (let i = 0; i < N; i++) uniqueSupplements.add(`supp_${i}`)

  const validIndices = Array.from({ length: M }, (_, i) => i)
  const noteValues: any[] = []
  for (let i = 0; i < M; i++) {
    noteValues.push({ supps: [`supp_${i % N}`, `supp_${(i + 1) % N}`] })
  }

  const biomarker = new Array(M)
  for (let i = 0; i < M; i++) biomarker[i] = Math.random()
  const rankedBiomarker = rankData(biomarker)

  const start1 = performance.now()
  for (let iter = 0; iter < 10; iter++) {
    const suppVectors = new Map<string, number[]>()
    uniqueSupplements.forEach((supp) => {
      suppVectors.set(supp, new Array(validIndices.length).fill(0))
    })

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

    uniqueSupplements.forEach((suppName) => {
      const filteredSuppVector = suppVectors.get(suppName)!
      const rankedSupp = rankBinaryDataArray(filteredSuppVector)
      calculateSpearmanRanked(rankedBiomarker, rankedSupp, {
        alpha: 0.05,
        alternative: 'two-sided',
      })
    })
  }
  console.log('Original map array allocation and computation: ', performance.now() - start1)

  const start2 = performance.now()
  for (let iter = 0; iter < 10; iter++) {
    const suppVectors = new Map<string, Int8Array>()
    uniqueSupplements.forEach((supp) => {
      suppVectors.set(supp, new Int8Array(validIndices.length))
    })

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

    uniqueSupplements.forEach((suppName) => {
      const filteredSuppVector = suppVectors.get(suppName)!
      const rankedSupp = rankBinaryDataInt8(filteredSuppVector)
      calculateSpearmanRanked(rankedBiomarker, rankedSupp, {
        alpha: 0.05,
        alternative: 'two-sided',
      })
    })
  }
  console.log(
    'Optimized map typed array Int8 allocation and computation: ',
    performance.now() - start2,
  )
})
