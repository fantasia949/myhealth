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
}];

const sourceAtom = atom(() => loadData());

export const getBioMarkersAtom = atom((get) =>
  get(sourceAtom).then(([data]) => processBiomarkers(data))
);

export const notesAtom = atom((get) =>
  get(sourceAtom).then(([_, notes]) => processTime(notes))
);

export const dataAtom = atom<BioMarker[]>((get) =>
  get(unwrap(getBioMarkersAtom, () => []))
);

export const filterTextAtom = atom("");
export const tagAtom = atom<string | null>(null);

export const visibleDataAtom = atom((get) => {
  let data = get(dataAtom);
  const filterText = get(filterTextAtom);
  const tag = get(tagAtom);
  if (data && (filterText || tag)) {
    data = data.filter((entry) => {
      const matchedTag = !tag || entry[3]?.tag.includes(tag);
      let matchedText = !filterText;
      if (!matchedText) {
        const words = filterText.toLowerCase().split(" ").filter(Boolean);
        const title = entry[0].toLowerCase();
        matchedText = words.some((word) => title.includes(word));
      }
      return matchedText && matchedTag;
    });
  }
  return data;
});

export const aiKeyAtom = atomWithStorage<string | null>("key", null);
