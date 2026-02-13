const parse = (val: number | string): number => typeof val === 'string' ? parseFloat(val) : val;

// https://www.longevityadvice.com/free-biological-age-calculator/
export function getPhenotypicAge(
  albumin: number | string,
  creatinine: number | string,
  glucose: number | string,
  crp: number | string,
  lymphocytePercent: number | string,
  mcv: number | string,
  rdw: number | string,
  alkalinePhosphatase: number | string,
  whiteBloodCellCount: number | string,
  chronologicalAge: number | string
) {
  const alb = parse(albumin) * 10;
  // g/L
  const creat = parse(creatinine) * 88.401;
  // mg/dL
  const gluc = parse(glucose) * 0.0555;
  // mmol/L
  const c_rp = Math.log(parse(crp) * 0.1);
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

  const lymph = parse(lymphocytePercent);
  const mean_cv = parse(mcv);
  const r_dw = parse(rdw);
  const alp = parse(alkalinePhosphatase);
  const wbc = parse(whiteBloodCellCount);
  const age = parse(chronologicalAge);

  // XB calculation
  const xb =
    b0 +
    bAlbumin * alb +
    bCreatinine * creat +
    bGlucose * gluc +
    bCrp * c_rp +
    bLymphocytePercent * lymph +
    bMcv * mean_cv +
    bRdw * r_dw +
    bAlkalinePhosphatase * alp +
    bWhiteBloodCellCount * wbc +
    bChronologicalAge * age;

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

export function getPhenotypicAge2(
  albumin: number | string,
  creatinine: number | string,
  glucose: number | string,
  cReactiveProtein: number | string,
  lymphocytePercent: number | string,
  meanCellVolume: number | string,
  redBloodCellDistributionWidth: number | string,
  alkalinePhosphatase: number | string,
  whiteBloodCellCount: number | string,
  ageInput: number | string
) {
  // Convert biomarker inputs
  const albumin_g_L = parse(albumin) * 10;
  const creatinine_umol_L = parse(creatinine) * 88.4;
  const glucose_mmol_L = parse(glucose) * 0.0555;
  const crpVal = parse(cReactiveProtein);

  if (crpVal <= 0) {
    throw new Error(
      "C Reactive Protein must be positive for logarithmic conversion."
    );
  }
  const crp_ln = Math.log(crpVal * 0.1);

  const b0 = -19.9067;

  const lymph = parse(lymphocytePercent);
  const mean_cv = parse(meanCellVolume);
  const r_dw = parse(redBloodCellDistributionWidth);
  const alp = parse(alkalinePhosphatase);
  const wbc = parse(whiteBloodCellCount);
  const age = parse(ageInput);

  // Calculate weighted terms
  const term_albumin = albumin_g_L * -0.0336;
  const term_creatinine = creatinine_umol_L * 0.0095;
  const term_glucose = glucose_mmol_L * 0.1953;
  const term_crp = crp_ln * 0.0954;
  const term_lymphocyte = lymph * -0.012;
  const term_mean_cell_volume = mean_cv * 0.0268;
  const term_red_cell_dist_width = r_dw * 0.3306;
  const term_alkaline_phosphatase = alp * 0.0019;
  const term_white_blood_cell_count = wbc * 0.0554;
  const term_age = age * 0.0804;

  // Calculate the linear combination (LinComb)
  const xb =
    term_albumin +
    term_creatinine +
    term_glucose +
    term_crp +
    term_lymphocyte +
    term_mean_cell_volume +
    term_red_cell_dist_width +
    term_alkaline_phosphatase +
    term_white_blood_cell_count +
    term_age +
    b0;

  // Adjust Mortality Score calculation
  const gamma = 0.0076927;
  const t_months = 120;
  const mort_score_part =
    1 - Math.exp((-Math.exp(xb) * (Math.exp(gamma * t_months) - 1)) / gamma);

  if (mort_score_part <= 0) {
    throw new Error(
      "Mortality score calculation part must be positive for logarithmic conversion."
    );
  }

  if (1 - mort_score_part <= 0) {
    throw new Error(
      "1 - MortScore must be positive for logarithmic conversion."
    );
  }

  // Calculate Phenotypic Age using Mortality Score
  const ptypic_age =
    141.50225 + Math.log(-0.00553 * Math.log(1 - mort_score_part)) / 0.09165;

  const dnam_phenoage =
    ptypic_age / (1 + 1.28047 * Math.exp(0.0344329 * (-182.344 + ptypic_age)));

  return dnam_phenoage;
}
