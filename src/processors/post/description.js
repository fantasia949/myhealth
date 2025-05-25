const description = {
  Glucose: "Glucose blood",
  "Uric acid": "Uric acid blood",
  Albumin: "Albumin blood",
  Calcium: "Calcium blood",
  "Vitamin D Total": "Vitamin D",
  "Bilirubin toàn phần": "Bilirubin toàn phần",
  "Bilirubin trực tiếp": "Bilirubin trực tiếp",
  "Bilirubin gián tiếp": "Bilirubin gián tiếp",
  "HBsAb định lượng": "HBsAb",
  "HCV Ab": "HCV Ab",
  ALP: "Alkaline Phosphatase",
  Ure: "Ure blood",
  Creatinin: "Creatinin blood",
  eGFR: "crcl: (140 - Age) * Weight * 1 / ( 72 * creatinine )",
  BUN: "Blood Urea Nitrogen",
  RBC: "Số lượng hồng cầu",
  Hb: "Hemoblobin",
  HCT: "Hematocrit: Hb * 3",
  MCV: "Mean Corpuscular Volume: HCT / RBC",
  MCH: "Mean Corpuscular Hemoglobin: Hb / RBC",
  MCHC: "Mean Corpuscular Hemoglobin Concentration: Hb / HCT",
  RDW: "Red Blood Cell Distribution: RDW-SD / MCV",
  PLT: "Số lượng tiểu cầu",
  MPV: "Thể tích trung bình TC",
  PCT: "Thể tích khối tiểu cầu",
  PDW: "Độ phân bố TC",
  WBC: "Số lượng bạch cầu",
  "RDW-SD": "Độ phân bố HC",
  NLR: "% Neutrophil / % Lymphocyte",
  VLDL: "Triglyceride / 5",
  LDL: "Total Cholesterol - HDL - VLDL",
};

// https://drjockers.com/functional-blood-analysis/

export default (entry) => {
  const [name, _values, _unit, extra] = entry;
  if (description[name]) {
    extra.description = description[name];
  }
  return entry;
};
