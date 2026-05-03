export default (notes: Notes) => {
  const supps = new Set<string>()
  const dates: Record<string, string[]> = {}

  for (const date in notes) {
    if (!Object.prototype.hasOwnProperty.call(notes, date)) continue
    const note = notes[date]
    if (!note.items) continue

    const { items: noteItems } = note
    if (!noteItems) continue

    const transients: string[] = []

    for (let i = 0; i < noteItems.length; i++) {
      const item = noteItems[i]
      const isExcluded = item.startsWith('-')
      const isTransient = /(~|\?)/.test(item)
      const isNote = /(\*)/.test(item)
      if (isNote) {
        continue
      }
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
    for (let i = 0; i < transients.length; i++) {
      supps.delete(transients[i])
    }
    console.log(noteItems, dates[date])
  }

  return notes
}
