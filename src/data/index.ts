import mergeEntries from "../processors/merge";
import { allEntries } from "./allEntries";

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
  "250812",
];

const mergeNotes = (inputs: Array<RawEntry>) =>
  Object.fromEntries(
    inputs.map((entry, index) => [
      labels[index],
      { supps: [], items: entry.notes },
    ])
  );

export const loadData = () => Promise.resolve([mergeEntries(allEntries), mergeNotes(allEntries)] as const);

// https://www.scymed.com/en/smnxps/psxkc035_c.htm
