import mergeEntries from "../processors/merge";

export const labels = [
  "200811",
  "201116",
  "210304",
  "210621",
  "220406",
  "221227",
  "230316",
  "230714",
  "231016",
  "240319",
  "240417",
  "240531",
  "240801",
  "240903",
  "241019",
  "241206",
  "241228",
  "250214",
  "250315",
  "250426",
  "250525",
  "250702",
];

const mergeNotes = (inputs: Array<RawEntry>) =>
  Object.fromEntries(
    inputs.map((entry, index) => [
      labels[index],
      { supps: [], items: entry.notes },
    ])
  );

export const loadData = () =>
  Promise.all(
    labels.map((label) =>
      import(`./20${label}.js`).then((module) => {
        const record: RawEntry = Array.isArray(module.default.entries)
          ? module.default
          : { entries: module.default };
        return record;
      })
    )
  ).then((entries) => [mergeEntries(entries), mergeNotes(entries)] as const);

// https://www.scymed.com/en/smnxps/psxkc035_c.htm
