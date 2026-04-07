import convertName from './convertName'
import convertUnit from './convertUnit'
import excludes from './excludes'

const setup = (entry: Entry): Entry => {
  entry[3] = {}

  // console.log(convertedEntries.reduce((result,  [name, values, unit, extra]) => {
  //   let range = extra.range
  //   if (typeof range === 'string') {
  //     range = range.split('-')
  //     if (range.length === 2) {
  //       range = [parseFloat(range[0]) || range[0], parseFloat(range[1]|| range[1])]
  //     }
  //   }
  //   result[name] = range
  //   return result
  // }, {}))

  // console.log(
  //   convertedEntries.reduce((result, [name, values, unit, extra]) => {
  //     result[name] = extra.description;
  //     return result;
  //   }, {})
  // );

  return entry
}

const preProcessEntry = (entry: Entry): Entry => {
  // Optimization: Unroll reduce loop and array allocation for better performance
  // Avoids `reduce` overhead in a hot loop processing every single entry.
  let result = setup(entry)
  result = convertName(result)
  result = convertUnit(result)
  return result
}

export default (entries: Entry[]): Entry[] => {
  // Optimization: Consolidate chained .filter().map() into a single loop
  // to avoid allocating intermediate arrays and reducing iterations.
  const result: Entry[] = []
  const len = entries.length
  for (let i = 0; i < len; i++) {
    const entry = entries[i]
    if (!excludes.includes(entry[0])) {
      result.push(preProcessEntry(entry))
    }
  }
  return result
}
