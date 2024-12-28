import { converter } from "../pre/convertUnit";

const MAX_VALUE = 9999;

const range = {
  Glucose: [3.9, 6.4],
  HbA1c: [4.2, 6.4],
  "Uric acid": [202.3, 416.5],
  Magnesium: [0.66, 1.07],
  Ferritin: [30, 400],
  "CRP-hs": [0, 5],
  Insulin: [2.6, 24.9],
  Albumin: [35, 52],
  Calcium: [2.15, 2.5],
  "IGF-1": [120, 160], //  116, 250 ["M: 116 ", " 250; F: 107 ", " 263 ng/ml"],
  Triglyceride: [0, 1.7],
  Cholesterol: [2.6, 5.2],
  HDL: [1.03, 2.07],
  LDL: [0, 3.4],
  "Vitamin D Total": [30, 70],
  T3: [1.3, 3.1],
  FT3: [3.1, 6.8],
  T4: [66, 181],
  FT4: [12, 22],
  Homocysteine: [5, 10],
  NLR: [1.2, 2],
  Testosterone: [8.64, 29],
  TSH: [0.27, 4.2],
  AST: [10, 26],
  ALT: [10, 26],
  "Bilirubin toàn phần": [0, 21],
  "Bilirubin trực tiếp": [0, 5],
  "Bilirubin gián tiếp": [0, 16],
  GGT: [8, 20],
  HBsAg: [0, 1.0],
  "HBsAb định lượng": [0, 10],
  "HCV Ab": [0, 1],
  ALP: [35, 105],
  Ure: [2.76, 8.07],
  Creatinin: [62, 106],
  eGFR: [90, MAX_VALUE],
  BUN: [3.27, 10.56],
  RBC: [4.4, 4.9],
  Hb: [14, 15],
  HCT: [39, 45],
  MCV: [85, 92],
  MCH: [28, 32],
  MCHC: [32, 35],
  "RDW-CV": [11.5, 13],
  PLT: [150, 450],
  MPV: [4, 11],
  PCT: [0.1, 1],
  PDW: [10, 16.5],
  WBC: [3.5, 6], // 10.5
  "% Neutrophil": [43, 76],
  "% Lymphocyte": [17, 48],
  "% Monocyte": [4, 8],
  "% Eosinophil": [0, 7],
  "% Basophil": [0, 2.5],
  "% Lympho không điển hình": [0, 2.5],
  "% Các TB non lớn": [0, 3],
  "SL Neutrophil": [2, 6.9],
  "SL Lymphocyte": [0.6, 3.4],
  "SL Monocyte": [0, 0.9],
  "SL Eosinophil": [0, 0.7],
  "SL Basophil": [0, 0.2],
  "SL Lympho không điển hình": [0, 0.25],
  "SL TB non lớn": [0, 0.3],
  "RDW-SD": [35, 56],
  "SL tiểu cầu KT lớn": [8, 129],
  "Tỉ lệ tiểu cầu có KT lớn": [5, 29],
  "Neutropil / Lymphocite": [1.2, 2],
  "TG / HDL": [0, 2],
  "Total Cholesterol / HDL": [1, 3],
  "HOMA-IR": [0, 2],
  LDH: [140, 180],
  "Serum iron": [10.744, 23.2787],
  "Protein Total": [64, 83],
  Tranferrin: [25.2, 45.4],
  Đồng: [62, 140],
  Kẽm: [80, 120],
  Natri: [136, 145],
  Kali: [3.6, 5.0],
  Clo: [96, 106],
  Cortisol: [140, 690],
};

export default (entry) => {
  const [name, _values, _unit, extra] = entry;

  let rangeValues = range[name];
  if (rangeValues) {
    const convert = converter[name];
    if (extra.originUnit && convert) {
      rangeValues = rangeValues.map((x) =>
        x != MAX_VALUE ? convert(x).toFixed(2) : "-"
      );
    }

    if (rangeValues.includes(MAX_VALUE)) {
      extra.range = ">=" + rangeValues[0];
    } else {
      extra.range = rangeValues.join(" - ");
    }
    extra.isNotOptimal = (value) => {
      const v = value && (value < +rangeValues[0] || value > +rangeValues[1]);
      return v;
    };
  } else {
    extra.isNotOptimal = (value) => false;
  }
  return entry;
};
