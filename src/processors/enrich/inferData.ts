import { getPhenotypicAge, getPhenotypicAge2 } from "./phenoAge";
import { labels } from "../../data";
import { BioMarker } from "../../atom/dataAtom";

type Recipe = [string, string[], (...args: any[]) => string, Partial<BioMarker[3]>?];

const recipes: Recipe[] = [
  [
    "Neutropil / Lymphocite",
    ["SL Neutrophil", "SL Lymphocyte"],
    (value1, value2) => (value1 / value2).toFixed(1),
  ],
  [
    "TG / HDL",
    ["Triglyceride", "HDL"],
    (value1, value2) => (value1 / value2).toFixed(1),
  ],
  [
    "Total Cholesterol / HDL",
    ["Cholesterol", "HDL"],
    (value1, value2) => (value1 / value2).toFixed(1),
  ],
  [
    "Triglyceride / HDL",
    ["Triglyceride", "HDL"],
    (value1, value2) => (value1 / value2).toFixed(1),
  ],
  [
    "LDL / HDL",
    ["LDL", "HDL"],
    (value1, value2) => (value1 / value2).toFixed(1),
  ],
  [
    "HOMA-IR",
    ["Glucose", "Insulin"],
    (value1, value2) => ((+value1 * +value2) / 405).toFixed(1),
  ],
  [
    "NLR",
    ["% Neutrophil", "% Lymphocyte"],
    (value1, value2) => (value1 / value2).toFixed(1),
  ],
  [
    "PhenoAge1",
    [
      "Albumin",
      "Creatinin",
      "Glucose",
      "CRP-hs",
      "% Lymphocyte",
      "MCV",
      "RDW-CV",
      "ALP",
      "WBC",
    ],
    (...args) => getPhenotypicAge(...args, 37).toFixed(1),
  ],
  [
    "PhenoAge2",
    [
      "Albumin",
      "Creatinin",
      "Glucose",
      "CRP-hs",
      "% Lymphocyte",
      "MCV",
      "RDW-CV",
      "ALP",
      "WBC",
    ],
    (...args) => getPhenotypicAge2(...args, 37).toFixed(1),
  ],
  ["VLDL", ["Triglyceride"], (triglyceride) => (triglyceride / 5).toFixed(0)],
  ["Age", [], (age) => age.toFixed(1)],
];

const getAge = (label: string) => {
  let year = "20" + label.slice(0, 2);
  const month = label.slice(2, 4);
  let yearNum = +year + parseInt(month) / 12;
  const age = yearNum - (1987 + 11 / 12);
  return age;
};

export default (entries: BioMarker[]): BioMarker[] => {
  const data = recipes.map(([name, fields, func, extra = {}]) => {
    const periods = entries[0][1].length;
    const values = Array.from({ length: periods }).map((_v, i) => {
      const fieldValues = fields.map(
        (field) => entries.find(([name]) => name === field)?.[1][i]
      );

      if (fieldValues.some((v) => !v)) {
        return null;
      }
      return func(...fieldValues, getAge(labels[i]));
    });
    if (!(extra as any).originValues) {
      (extra as any).originValues = Array.from({ length: periods });
    }
    (extra as any).inferred = true;
    return [name, values, null, extra] as any;
  });

  return [...entries, ...data];
};
