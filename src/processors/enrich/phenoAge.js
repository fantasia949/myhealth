// https://www.longevityadvice.com/free-biological-age-calculator/
export function getPhenotypicAge(
  albumin,
  creatinine,
  glucose,
  crp,
  lymphocytePercent,
  mcv,
  rdw,
  alkalinePhosphatase,
  whiteBloodCellCount,
  chronologicalAge
) {
  albumin = albumin * 10;
  // g/L
  creatinine = creatinine * 88.401;
  // mg/dL
  glucose = glucose * 0.0555;
  // mmol/L
  crp = Math.log(crp * 0.1);
  // Constants
  const b0 = -19.9067;
  const bAlbumin = -0.0336;
  const bCreatinine = 0.0095;
  const bGlucose = 0.1953;
  const bCrp = 0.0954;
  const bLymphocytePercent = -0.012;
  const bMcv = 0.0268;
  const bRdw = 0.3306;
  const bAlkalinePhosphatase = 0.00188;
  const bWhiteBloodCellCount = 0.0554;
  const bChronologicalAge = 0.0804;

  // XB calculation
  const xb =
    b0 +
    bAlbumin * albumin +
    bCreatinine * creatinine +
    bGlucose * glucose +
    bCrp * crp +
    bLymphocytePercent * lymphocytePercent +
    bMcv * mcv +
    bRdw * rdw +
    bAlkalinePhosphatase * alkalinePhosphatase +
    bWhiteBloodCellCount * whiteBloodCellCount +
    bChronologicalAge * chronologicalAge;

  // M calculation
  const gamma = -1.51714;
  const lambda = 0.0076927;
  const M = 1 - Math.exp((gamma * Math.exp(xb)) / lambda);

  // Phenotypic Age calculation
  const alpha = 141.50225;
  const beta = -0.00553;
  const phenoAge = alpha + Math.log(beta * Math.log(1 - M)) / 0.09165;

  return phenoAge;
}
