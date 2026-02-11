import { atom } from "jotai";
import { unwrap, atomWithStorage } from "jotai/utils";
import { loadData } from "../data";
import { processBiomarkers, processTime } from "../processors";

export type BioMarker = [string, number[], string, {
  tag: string[];
  inferred?: boolean;
  originValues?: (string | number | null)[];
  hasOrigin?: boolean;
  range?: unknown;
  description?: string;
  isNotOptimal: (value: number) => boolean;
  getSamples: (num: number, count?: number) => string[];
  originUnit?: string;
  normalizedTitle?: string;
  sortTag?: string;
  processedTags?: { tag: string; displayTag: string; sortKey: string }[];
}];

const sourceAtom = atom(() => loadData());

export const getBioMarkersAtom = atom((get) =>
  get(sourceAtom).then(([data]) => processBiomarkers(data))
);

export const notesAtom = atom((get) =>
  get(sourceAtom).then(([_, notes]) => processTime(notes))
);

import { loadable } from "jotai/utils";

const loadableBioMarkersAtom = loadable(getBioMarkersAtom);

export const dataAtom = atom<BioMarker[]>((get) => {
  const loadableBioMarkers = get(loadableBioMarkersAtom);
  if (loadableBioMarkers.state === "hasData") {
    return loadableBioMarkers.data;
  }
  return [];
});

export const filterTextAtom = atom("");
export const tagAtom = atom<string | null>(null);

export const visibleDataAtom = atom((get) => {
  let data = get(dataAtom);
  const filterText = get(filterTextAtom);
  const tag = get(tagAtom);
  if (data && (filterText || tag)) {
    const lowerFilterText = filterText ? filterText.toLowerCase() : "";
    const words = lowerFilterText.split(" ").filter(Boolean);
    const hasFilterText = !!filterText;

    data = data.filter((entry) => {
      const matchedTag = !tag || entry[3].tag.includes(tag);
      if (!matchedTag) {
        return false;
      }

      if (!hasFilterText) {
        return true;
      }

      if (words.length === 0) {
        return false;
      }

      // Optimization: use pre-calculated lowercase title to avoid O(N) string allocation in filter loop
      const title = entry[3].normalizedTitle!;
      return words.some((word) => title.includes(word));
    });
  }
  return data;
});

export const aiKeyAtom = atomWithStorage<string | null>("key", null);
export const aiModelAtom = atomWithStorage<string>("model", "gemini-2.5-pro");
export const gistTokenAtom = atomWithStorage<string | null>("gistToken", null);
