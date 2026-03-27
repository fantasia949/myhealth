export const converter: Record<string, (value: number) => number> = {
  Glucose: (value) => value * 18,
  Triglyceride: (value) => Math.round(value / 0.0113),
  Testosterone: (value) => Math.round(value * 28.85),
  'Serum iron': (value) => Math.round(value * 5.587),
  Cholesterol: (value) => Math.round(value * 38.610039),
  HDL: (value) => Math.round(value * 38.610039),
  LDL: (value) => Math.round(value * 38.610039),
  Uric: (value) => value / 59.48,
  Creatinin: (value) => value / 88.42,
  Albumin: (value) => value / 10,
}

const valueMapper = (
  val: string | undefined,
  unit: string,
  name: string,
): [string | undefined, string | undefined, (string | undefined)?, string?] => {
  if (val === undefined || val === null || val === '') {
    return [undefined, undefined, undefined, undefined]
  }

  let value: number | string = parseFloat(val)
  if (isNaN(value)) {
    return [val, unit, undefined, undefined]
  }

  let originValue: number | undefined = undefined
  let originUnit: string | undefined = undefined

  if (unit === 'mmol/L' && name === 'Glucose') {
    originValue = value
    value = converter[name](value)
    originUnit = unit
    unit = 'mg/L'
  }

  if (unit === 'mmol/L' && name === 'Triglyceride') {
    originValue = value
    value = converter[name](value)
    originUnit = unit
    unit = 'mg/dL'
  }

  if (unit === 'nmol/L' && name === 'Testosterone') {
    originValue = value
    value = converter[name](value)
    originUnit = unit
    unit = 'ng/dL'
  }

  if (unit === 'µmol/L' && name === 'Serum iron') {
    originValue = value
    value = converter[name](value)
    originUnit = unit
    unit = 'μg/dL'
  }

  if (unit === 'µmol/L' && name === 'Uric') {
    originValue = value
    value = converter[name](value)
    originUnit = unit
    unit = 'μg/dL'
  }

  if (unit === 'mmol/L' && ['Cholesterol', 'HDL', 'LDL'].includes(name)) {
    originValue = value
    value = converter[name](value)
    originUnit = unit
    unit = 'mg/dL'
  }

  if (unit === 'µmol/L' && name === 'Creatinin') {
    originValue = value
    value = converter[name](value)
    originUnit = unit
    unit = 'mg/dL'
  }

  if (unit === 'g/L' && name === 'Albumin') {
    originValue = value
    value = converter[name](value)
    originUnit = unit
    unit = 'g/dL'
  }

  let resultValue: string = val
  if (typeof value === 'number') {
    resultValue = value.toFixed(2)
  }

  return [
    resultValue,
    unit,
    originValue !== undefined ? originValue.toFixed(2) : undefined,
    originUnit,
  ]
}

export default ([name, values, unit, extra]: Entry): Entry => {
  const len = values.length
  // Optimization: Pre-allocate target arrays and use a single for-loop
  // instead of chaining Array.map(), Array.filter(), and Array.some()
  // to eliminate redundant iteration, reduce closure creation, and avoid
  // heavy garbage collection overhead on intermediate array allocations.
  const newValues = new Array(len)
  const originValues = new Array(len)

  let newUnit: string | undefined = undefined
  let originUnit: string | undefined = undefined
  let hasOrigin = false

  for (let i = 0; i < len; i++) {
    const [mappedVal, mappedUnit, mappedOriginVal, mappedOriginUnit] = valueMapper(values[i], unit, name)
    newValues[i] = mappedVal as string

    if (newUnit === undefined && mappedUnit) {
      newUnit = mappedUnit
    }

    if (mappedOriginVal !== undefined) {
      hasOrigin = true
      originValues[i] = mappedOriginVal
    } else {
      originValues[i] = null
    }

    if (originUnit === undefined && mappedOriginUnit) {
      originUnit = mappedOriginUnit
    }
  }

  const newExtra = extra || {}
  newExtra.hasOrigin = hasOrigin
  newExtra.originValues = originValues
  newExtra.originUnit = originUnit

  return [name, newValues, newUnit || unit, newExtra]
}
