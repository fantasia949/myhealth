const description = {
  Glucose: "Glucose blood",
  Uric: "Uric acid blood",
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
  eGFR: "Mức lọc cầu thận",
  BUN: "Blood Urea Nitrogen",
  RBC: "Số lượng hồng cầu",
  Hb: "Hemoblobin",
  HCT: "Hematocrit",
  MCV: "Mean Corpuscular Volume",
  MCH: "Mean Corpuscular Hemoglobin",
  MCHC: "Mean Corpuscular Hemoglobin Concentration",
  RDW: "Red Blood Cell Distribution",
  PLT: "Số lượng tiểu cầu",
  MPV: "Thể tích trung bình TC",
  PCT: "Thể tích khối tiểu cầu",
  PDW: "Độ phân bố TC",
  WBC: "Số lượng bạch cầu",
  "RDW-SD": "Độ phân bố HC",
  NLR: "% Neutrophil / % Lymphocyte",
};

// https://drjockers.com/functional-blood-analysis/

export default (entry) => {
  const [name, _values, _unit, extra] = entry;
  if (description[name]) {
    extra.description = description[name];
  }
  return entry;
};
