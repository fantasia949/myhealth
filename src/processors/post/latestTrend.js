export default (entries) => {
  entries.forEach((entry) => {
    values = entry[1];
    extra = entry[3];
    const length = values.length;
    const latest = values[length - 1];
    const source = values[length - 2];
    if (latest && source) {
      const v = latest - source;
      if (v) {
        extra.trend = v / Math.abs(v);
      }
    }
  });
  return entries;
};
