import { BioMarker } from '../../types/biomarker'

export default (entries: BioMarker[]): BioMarker[] => {
  for (const entry of entries) {
    const extra = entry[3]
    const values = entry[1]
    if (extra) {
      extra.getSamples = (num: number, count = 1) => {
        if (num <= 1) {
          return values.map(String)
        }
        const output: string[] = []
        for (let i = values.length - 1; i >= 0; i = i - num) {
          let actualNum = 0
          let sum = 0
          for (let j = 0; j < num; j++) {
            const value = values[i - j]
            if (value) {
              sum += +value || 0
              actualNum++
            }
          }

          // ⚡ Bolt Optimization: Replace O(N^2) .unshift() with O(1) .push()
          // Calling .unshift() inside a loop forces V8 to shift all existing elements
          // in the array on every iteration. Pushing and reversing at the end is O(N).
          output.push((sum / actualNum).toFixed(2))

          if (count && output.length >= count) {
            break
          }
        }
        return output.reverse()
      }
    }
  }

  return entries
}
