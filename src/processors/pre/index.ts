import convertName from "./convertName";
import convertUnit from "./convertUnit";
import excludes from "./excludes";

const setup = (entry: Entry): Entry => {
  entry[3] = {};

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

  return entry;
};

const preProcessEntry = (entry: Entry): Entry => {
  const funcs = [setup, convertName, convertUnit];
  return funcs.reduce((result, func) => func(result), entry);
};

export default (entries: Entry[]): Entry[] => {
  entries = entries.filter((entry) => !excludes.includes(entry[0]));
  entries = entries.map(preProcessEntry);
  return entries;
};
