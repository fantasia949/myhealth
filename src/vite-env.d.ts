/// <reference types="vite/client" />

type RawEntry = {
  entries: Array<RawSubEntry>;
  notes?: Array<string>;
};

type RawSubEntry = [
  name: string,
  value: string,
  unit: string,
  extra?: Record<string, any>
];

type Entry = [
  name: string,
  values: Array<string>,
  unit: string,
  extra?: Record<string, any>
];

type Notes = Record<string, NoteItem>;
type NoteItem = { items: string[]; supps: string[] };
