import mergeEntries from "../processors/merge";
import data from "./aggregated";

const addLabels = ["251015", "251120"];

export const labels = [...data.map((item) => item.time), ...addLabels];

const mergeNotes = (inputs: Array<RawEntry>): Notes =>
  Object.fromEntries(
    inputs.map((entry, index) => [
      labels[index],
      { date: labels[index], supps: [], items: entry.notes || [] },
    ])
  );

const loadNewData = (): Promise<RawEntry[]> =>
  Promise.all(
    addLabels.map((label) =>
      import(`./20${label}.ts`).then((module) => {
        const record: RawEntry & { time?: string } = Array.isArray(
          module.default.entries
        )
          ? module.default
          : { entries: module.default };
        record.time = label;
        return record;
      })
    )
  );

export const loadData = async () => {
  const newData: any[] = [...data, ...(await loadNewData())];
  return [mergeEntries(newData), mergeNotes(newData)] as const;
};

// https://www.scymed.com/en/smnxps/psxkc035_c.htm
