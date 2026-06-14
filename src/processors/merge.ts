export default (inputs: Array<RawEntry>): Entry[] => {
  // Optimization: Pre-compute a lookup Map of entries to avoid O(N) Array.find()
  // calls inside the nested entries loop. This reduces complexity from O(T*U) to O(T),
  // where T is Total Entries and U is Unique Entries.
  const map = new Map<string, Entry>()
  const len = inputs.length

  for (let index = 0; index < len; index++) {
    const info = inputs[index]
    const entries = info.entries
    for (let i = 0; i < entries.length; i++) {
      const [name, value, unit, extra] = entries[i]
      let matchedEntry = map.get(name)

      if (matchedEntry) {
        matchedEntry[1][index] = value
      } else {
        const values = Array.from<string>({ length: len })
        values[index] = value
        matchedEntry = [name, values, unit as string, extra]
        map.set(name, matchedEntry)
      }
    }
  }

  return Array.from(map.values())
}
