export default (entries: Entry[]): Entry[] => {
  // ⚡ Bolt Optimization: Replace .forEach() with a standard for-loop to eliminate closure allocation overhead.
  const len = entries.length
  for (let i = 0; i < len; i++) {
    const entry = entries[i]
    const values = entry[1]
    const extra = entry[3]
    const length = values.length
    const latestStr = values[length - 1]
    const sourceStr = values[length - 2]

    if (latestStr && sourceStr && extra) {
      const latest = parseFloat(latestStr)
      const source = parseFloat(sourceStr)

      if (!isNaN(latest) && !isNaN(source)) {
        const v = latest - source
        if (v !== 0) {
          extra.trend = v / Math.abs(v)
        }
      }
    }
  }
  return entries
}
