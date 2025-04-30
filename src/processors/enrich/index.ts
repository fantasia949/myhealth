import inferData from "./inferData";
import trackSuppStack from "./suppStack";

export function enrichBiomarkers(entries: Array<Entry>) {
  entries = inferData(entries);

  return entries;
}

export function enrichTime(notes: Notes) {
  notes = trackSuppStack(notes);
  return notes;
}
