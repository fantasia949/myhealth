import mergeEntries from "../processors/merge";
import data from "./aggregated";

const addLabels = ["20251015"];

export const labels = [...data.map((item) => item.time), ...addLabels];

const mergeNotes = (inputs: Array<RawEntry>) =>
  Object.fromEntries(
    inputs.map((entry, index) => [
      labels[index],
      { supps: [], items: entry.notes },
    ])
  );

// export const loadData2 = () =>
//   Promise.all(
//     addLabels.map((label) =>
//       import(`./20${label}.js`).then((module) => {
//         const record: RawEntry = Array.isArray(module.default.entries)
//           ? module.default
//           : { entries: module.default };
//         record.time = label;
//         return record;
//       })
//     )
//   ).then((entries) => {
//     entries = [...data, ...entries];
//     return [mergeEntries(entries), mergeNotes(entries)] as const;
//   });

export const loadData = async () => {
  return [mergeEntries(data), mergeNotes(data)] as const;
};

// https://www.scymed.com/en/smnxps/psxkc035_c.htm
