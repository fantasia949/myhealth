import preProcess from "./pre";
import { enrichBiomarkers, enrichTime } from "./enrich";
import postProcess from "./post";
import { tagKeys, unsortedTags } from "./post/tag";
import { BioMarker } from "../atom/dataAtom";

export const tags = tagKeys;

export const processTime = (notes: Notes) => {
  return enrichTime(notes);
};

export const processBiomarkers = (entries: Array<Entry>): BioMarker[] => {
  let biomarkers: BioMarker[] = preProcess(entries) as any;
  biomarkers = enrichBiomarkers(biomarkers);
  biomarkers = postProcess(biomarkers as any) as any;
  // console.log(output);

  // Optimization: Pre-calculate normalized title to avoid repetitive toLowerCase() calls in filter loops
  biomarkers.forEach((entry) => {
    if (entry[3]) {
      entry[3].normalizedTitle = entry[0].toLowerCase();
    }
  });

  return biomarkers.sort((entry1, entry2) => {
    const tag1 =
      entry1[3]?.tag.filter((tag) => !unsortedTags.includes(tag))[0] ?? "";
    const tag2 =
      entry2[3]?.tag.filter((tag) => !unsortedTags.includes(tag))[0] ?? "";
    // console.log(tag1, tag2, entry1[0], entry2[0], entry1[3].tag, entry2[3].tag);
    if (tag1 > tag2) {
      return 1;
    }
    if (tag1 < tag2) {
      return -1;
    }
    return 0;
  });
};
