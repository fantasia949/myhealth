import { atom } from "jotai";
import { unwrap, atomWithStorage } from "jotai/utils";
import { loadData } from "../data";
import { processBiomarkers, processTime } from "../processors";
import { rankData } from "../processors/stats";
import { BioMarker } from "../types/biomarker";

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

export const rankedDataMapAtom = atom((get) => {
  const data = get(dataAtom);
  const map = new Map<string, Float64Array>();
  data.forEach((item) => {
    const values = item[1].map((v) => (v ? +v : 0));
    map.set(item[0], rankData(values));
  });
  return map;
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

    // Optimization: Hoist invariant check outside of filter loop.
    if (hasFilterText && words.length === 0) {
      return [];
    }

    data = data.filter((entry) => {
      const matchedTag = !tag || entry[3].tag.includes(tag);
      if (!matchedTag) {
        return false;
      }

      if (!hasFilterText) {
        return true;
      }

      // Optimization: use pre-calculated lowercase title to avoid O(N) string allocation in filter loop
      const title = entry[3].normalizedTitle!;
      return words.some((word) => title.includes(word));
    });
  }
  return data;
});

export const aiKeyAtom = atomWithStorage<string | null>("key", null);
export const aiModelAtom = atomWithStorage<string>("model", "gemini-3-flash-preview");
export const gistTokenAtom = atomWithStorage<string | null>("gistToken", null);

export const nonInferredDataAtom = atom((get) => {
  const data = get(dataAtom);
  return data.filter((item) => !item[3]?.inferred);
});
