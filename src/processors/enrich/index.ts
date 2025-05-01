import inferData from "./inferData";
import sampling from "./sampling";
import trackSuppStack from "./suppStack";

export function enrichBiomarkers(entries: Array<Entry>) {
  entries = inferData(entries);
  entries = sampling(entries);
  // console.log(entries[0][3].getSamples(3));

  return entries;
}

export function enrichTime(notes: Notes) {
  notes = trackSuppStack(notes);
  return notes;
}
