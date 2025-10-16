import mergeEntries from "../processors/merge";
import data from "./aggregated";

const addLabels = ["251015"];

export const labels = [...data.map((item) => item.time), ...addLabels];

const mergeNotes = (inputs: Array<RawEntry>) =>
  Object.fromEntries(
    inputs.map((entry, index) => [
      labels[index],
      { supps: [], items: entry.notes },
    ])
  );

const loadNewData = () =>
  Promise.all(
    addLabels.map((label) =>
      import(`./20${label}.ts`).then((module) => {
        const record: RawEntry = Array.isArray(module.default.entries)
          ? module.default
          : { entries: module.default };
        record.time = label;
        return record;
      })
    )
  );

export const loadData = async () => {
  const newData = [...data, ...(await loadNewData())];
  return [mergeEntries(newData), mergeNotes(newData)] as const;
};

// https://www.scymed.com/en/smnxps/psxkc035_c.htm
