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
  // Optimization: Pre-calculate sortTag to avoid repetitive filtering in sort comparator
  biomarkers.forEach((entry) => {
    if (entry[3]) {
      entry[3].normalizedTitle = entry[0].toLowerCase();
      entry[3].sortTag =
        entry[3].tag.find((tag) => !unsortedTags.includes(tag)) || "";
    }
  });

  return biomarkers.sort((entry1, entry2) => {
    const tag1 = entry1[3]?.sortTag ?? "";
    const tag2 = entry2[3]?.sortTag ?? "";

    if (tag1 > tag2) {
      return 1;
    }
    if (tag1 < tag2) {
      return -1;
    }
    return 0;
  });
};
