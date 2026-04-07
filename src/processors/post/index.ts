import applyTag from './tag'
import applyRange from './range'
import applyDescription from './description'

const postProcessEntry = (entry: Entry): Entry => {
  // Optimization: Unroll reduce loop and array allocation for better performance
  // Avoids `reduce` overhead in a hot loop processing every single entry.
  let result = applyTag(entry)
  result = applyRange(result)
  result = applyDescription(result)
  return result
}

export default (entries: Entry[]): Entry[] => {
  // Optimization: Use a classic for-loop with pre-allocated array instead of .map()
  // to reduce object allocation and garbage collection overhead.
  const len = entries.length
  const result = new Array(len)
  for (let i = 0; i < len; i++) {
    result[i] = postProcessEntry(entries[i])
  }
  return result
}
