export default (entries: Array<Entry>) => {
  for (const entry of entries) {
    const extra = entry[3];
    const values = entry[1];
    extra.getSamples = (num: number, count = 1) => {
      if (num <= 1) {
        return values;
      }
      const output = [];
      for (let i = values.length - 1; i >= 0; i = i - num) {
        let actualNum = 0;
        let sum = 0;
        for (let j = 0; j < num; j++) {
          const value = values[i - j];
          if (value) {
            sum += +value || 0;
            actualNum++;
          }
        }
        output.unshift((sum / actualNum).toFixed(2));

        if (count && output.length >= count) {
          break;
        }
      }
      return output;
    };
  }

  return entries;
};
