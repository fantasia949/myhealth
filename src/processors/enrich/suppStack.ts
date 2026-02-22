export default (notes: Notes) => {
  const supps = new Set<string>();
  const dates: Record<string, string[]> = {};

  Object.entries(notes)
    .filter(([_, note]) => !!note.items)
    .forEach(([date, note]) => {
      const { items: noteItems } = note;
      if (!noteItems) {
        return;
      }
      const transients: string[] = [];

      noteItems.forEach((item) => {
        const isExcluded = item.startsWith("-");
        const isTransient = /(\~|\?)/.test(item);
        const isNote = /(\*)/.test(item);
        if (isNote) {
          return;
        }
        const token = item.replaceAll(/^(\+|-)/g, "");
        if (isTransient) {
          transients.push(token);
        }
        if (isExcluded) {
          supps.delete(token);
        } else {
          supps.add(token);
        }
      });
      dates[date] = note.supps = [...supps.values()];
      transients.forEach((token) => supps.delete(token));
      console.log(noteItems, dates[date]);
    });

  return notes;
};
