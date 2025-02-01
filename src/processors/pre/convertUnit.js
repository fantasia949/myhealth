export const converter = {
  Glucose: (value) => value * 18,
  Triglyceride: (value) => Math.round(value / 0.0113),
  Testosterone: (value) => Math.round(value * 28.85),
  "Serum iron": (value) => Math.round(value * 5.587),
  Cholesterol: (value) => Math.round(value * 38.610039),
  HDL: (value) => Math.round(value * 38.610039),
  LDL: (value) => Math.round(value * 38.610039),
  Uric: (value) => value / 59.48,
  Creatinin: (value) => value / 88.42,
  Albumin: (value) => value / 10,
};

const valueMapper = (value, unit, name) => {
  if (!value) {
    return [];
  }

  let originValue = undefined;
  let originUnit = undefined;
  if (unit === "mmol/L" && name === "Glucose") {
    originValue = value;
    value = converter[name](value);
    originUnit = unit;
    unit = "mg/L";
  }

  if (unit === "mmol/L" && name === "Triglyceride") {
    originValue = value;
    value = converter[name](value);
    originUnit = unit;
    unit = "mg/dL";
  }

  if (unit === "nmol/L" && name === "Testosterone") {
    originValue = value;
    value = converter[name](value);
    originUnit = unit;
    unit = "ng/dL";
  }

  if (unit === "µmol/L" && name === "Serum iron") {
    originValue = value;
    value = converter[name](value);
    originUnit = unit;
    unit = "μg/dL";
  }

  if (unit === "µmol/L" && name === "Uric") {
    originValue = value;
    value = converter[name](value);
    originUnit = unit;
    unit = "μg/dL";
  }

  if (unit === "mmol/L" && ["Cholesterol", "HDL", "LDL"].includes(name)) {
    originValue = value;
    value = converter[name](value);
    originUnit = unit;
    unit = "mg/dL";
  }

  if (unit === "µmol/L" && name === "Creatinin") {
    originValue = value;
    value = converter[name](value);
    originUnit = unit;
    unit = "mg/dL";
  }

  if (unit === "g/L" && name === "Albumin") {
    originValue = value;
    value = converter[name](value);
    originUnit = unit;
    unit = "g/dL";
  }

  if (typeof value === "number") {
    value = value.toFixed(2);
  }

  return [value, unit, originValue, originUnit];
};

const mapValue = (name, matchedUnit, targetUnit, func) => {};

export default ([name, values, unit, extra]) => {
  const mappedResult = values.map((value) => valueMapper(value, unit, name));
  const newValues = mappedResult.map((entry) => entry[0]);
  const newUnit = mappedResult.map((entry) => entry[1]).filter(Boolean)[0];
  extra.hasOrigin = mappedResult.some((entry) => entry[2]);
  extra.originValues = mappedResult.map((entry) => entry[2]);
  extra.originUnit = mappedResult.map((entry) => entry[3]).filter(Boolean)[0];
  return [name, newValues, newUnit, extra];
};
