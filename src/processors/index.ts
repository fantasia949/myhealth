import preProcess from "./pre";
import { enrichBiomarkers, enrichTime } from "./enrich";
import postProcess from "./post";
import { tagKeys, unsortedTags } from "./post/tag";

export const tags = tagKeys;

export const processTime = (notes: Notes) => {
  return enrichTime(notes);
};

export const processBiomarkers = (entries: Array<Entry>) => {
  entries = preProcess(entries);
  entries = enrichBiomarkers(entries);
  entries = postProcess(entries);
  // console.log(output);

  return entries.toSorted((entry1, entry2) => {
    const tag1 =
      entry1[3]?.tag.filter((tag) => !unsortedTags.includes(tag))[0] ?? "";
    // const tag2 =
    //   entry2[3]?.tag.filter((tag) => !unsortedTags.includes(tag))[0] ?? "";
    // console.log(tag1, tag2, entry1[0], entry2[0], entry1[3].tag, entry2[3].tag);
    return tag1[0];
  });
};
