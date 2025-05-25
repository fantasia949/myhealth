import { getPhenotypicAge, getPhenotypicAge2 } from "./phenoAge";
import { labels } from "../../data";

const recipes = [
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

const getAge = (label) => {
  let year = "20" + label.slice(0, 2);
  const month = label.slice(2, 4);
  year = +year + month / 12;
  const age = year - (1987 + 11 / 12);
  return age;
};

export default (entries) => {
  const data = recipes.map(([name, fields, func, extra = {}]) => {
    const periods = entries[0][1].length;
    const values = Array.from({ length: periods }).map((_v, i) => {
      const fieldValues = fields.map(
        (field) => entries.find(([name]) => name === field)[1][i]
      );

      if (fieldValues.some((v) => !v)) {
        return null;
      }
      return func(...fieldValues, getAge(labels[i]));
    });
    if (!extra.originValues) {
      extra.originValues = Array.from({ length: periods });
    }
    extra.inferred = true;
    return [name, values, null, extra];
  });

  return [...entries, ...data];
};
