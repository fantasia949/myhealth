import preProcess from "./pre";
import enrich from "./enrich";
import postProcess from "./post";
import { tagKeys } from "./post/tag";

import orderby from "lodash.orderby";

export const tags = tagKeys;

export const process = (entries) => {
  console.log(entries);
  entries = preProcess(entries);
  entries = enrich(entries);
  entries = postProcess(entries);
  return orderby(entries, (entry) => entry[3].tag);
};
