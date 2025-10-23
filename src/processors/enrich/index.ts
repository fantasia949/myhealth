import inferData from "./inferData";
import sampling from "./sampling";
import trackSuppStack from "./suppStack";
import { BioMarker } from "../../atom/dataAtom";

export function enrichBiomarkers(entries: BioMarker[]): BioMarker[] {
  entries = inferData(entries);
  entries = sampling(entries);
  // console.log(entries[0][3].getSamples(3));

  return entries;
}

export function enrichTime(notes: Notes) {
  notes = trackSuppStack(notes);
  return notes;
}
