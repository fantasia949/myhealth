export default (notes: Notes) => {
  const supps = new Set<string>()
  const dates: Record<string, string[]> = {}

  // Optimization: Replaced chained .filter().forEach() with standard for-loops to eliminate closure creation and garbage collection overhead in hot path.
  const entries = Object.entries(notes)
  for (let i = 0; i < entries.length; i++) {
    const [date, note] = entries[i]
    if (!note.items) continue

    const noteItems = note.items
    const transients: string[] = []

    for (let j = 0; j < noteItems.length; j++) {
      const item = noteItems[j]
      const isExcluded = item.startsWith('-')
      const isTransient = /(~|\?)/.test(item)
      const isNote = /(\*)/.test(item)

      if (isNote) continue

      const token = item.replaceAll(/^(\+|-|~)*/g, '')
      if (isTransient) {
        transients.push(token)
      }
      if (isExcluded) {
        supps.delete(token)
      } else {
        supps.add(token)
      }
    }

    dates[date] = note.supps = [...supps.values()]

    for (let k = 0; k < transients.length; k++) {
      supps.delete(transients[k])
    }
    console.log(noteItems, dates[date])
  }

  return notes
}
