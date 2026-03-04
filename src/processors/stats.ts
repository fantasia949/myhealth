import pcorrtest from "@stdlib/stats-pcorrtest";

// Beta function approximation or exact implementation
function betacf(a: number, b: number, x: number) {
    const MAXIT = 100;
    const EPS = 3.0e-7;
    const FPMIN = 1.0e-30;

    let m, m2, aa, c, d, del, h, qab, qam, qap;

    qab = a + b;
    qap = a + 1.0;
    qam = a - 1.0;
    c = 1.0;
    d = 1.0 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1.0 / d;
    h = d;
    for (m = 1; m <= MAXIT; m++) {
        m2 = 2 * m;
        aa = m * (b - m) * x / ((qam + m2) * (a + m2));
        d = 1.0 + aa * d;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        c = 1.0 + aa / c;
        if (Math.abs(c) < FPMIN) c = FPMIN;
        d = 1.0 / d;
        h *= d * c;
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
        d = 1.0 + aa * d;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        c = 1.0 + aa / c;
        if (Math.abs(c) < FPMIN) c = FPMIN;
        d = 1.0 / d;
        del = d * c;
        h *= del;
        if (Math.abs(del - 1.0) < EPS) break;
    }
    return h;
}

function gammln(xx: number) {
    let x, y, tmp, ser;
    const cof = [76.18009172947146, -86.50532032941677,
                 24.01409824083091, -1.231739572450155,
                 0.1208650973866179e-2, -0.5395239384953e-5];
    y = xx;
    x = xx;
    tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    ser = 1.000000000190015;
    for (let j = 0; j <= 5; j++) {
        ser += cof[j] / ++y;
    }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function betai(a: number, b: number, x: number) {
    let bt;
    if (x === 0.0 || x === 1.0) {
        bt = 0.0;
    } else {
        bt = Math.exp(gammln(a + b) - gammln(a) - gammln(b) + a * Math.log(x) + b * Math.log(1.0 - x));
    }
    if (x < (a + 1.0) / (a + b + 2.0)) {
        return bt * betacf(a, b, x) / a;
    } else {
        return 1.0 - bt * betacf(b, a, 1.0 - x) / b;
    }
}

function studentT_cdf(t: number, df: number) {
    const x = df / (df + t * t);
    const p = betai(df / 2.0, 0.5, x);
    if (t > 0) {
        return 1.0 - 0.5 * p;
    } else {
        return 0.5 * p;
    }
}

const calculatePearsonValue = (x: number[], y: number[]) => {
  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const xi = x[i];
    const yi = y[i];
    sumX += xi;
    sumY += yi;
    sumXY += xi * yi;
    sumX2 += xi * xi;
    sumY2 += yi * yi;
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  let r = numerator / denominator;
  // Clamp r to [-1, 1] to avoid NaN due to floating point inaccuracies
  if (r > 1) return 1;
  if (r < -1) return -1;
  return r;
};

// Optimization: Inlined Pearson correlation logic to avoid the overhead of @stdlib/stats-pcorrtest
// Argument parsing and memory allocations in hot loops are expensive
function pcorrtest_manual(
  x: number[],
  y: number[],
  options?: { alpha?: number; alternative?: "two-sided" | "less" | "greater" }
) {
  const alpha = options?.alpha ?? 0.05;
  const alternative = options?.alternative ?? "two-sided";
  const n = x.length;
  const r = calculatePearsonValue(x, y);

  // calculate p-value
  const df = n - 2;

  if (r === 1 || r === -1) {
    return {
      pcorr: r,
      statistic: r === 1 ? Infinity : -Infinity,
      pValue: 0,
      rejected: true,
      alpha,
      print: function () {
        return `Pearson correlation: ${r.toFixed(4)}\np-value: 0\nt-statistic: ${r === 1 ? 'Infinity' : '-Infinity'}\nalpha: ${alpha}\nalternative: ${alternative}\nnull hypothesis rejected: true\n`;
      }
    };
  }

  const t = r * Math.sqrt(df / (1 - r * r));
  let pValue;

  if (alternative === "two-sided") {
    pValue = 2 * (1 - studentT_cdf(Math.abs(t), df));
  } else if (alternative === "less") {
    pValue = studentT_cdf(t, df);
  } else {
    pValue = 1 - studentT_cdf(t, df);
  }

  return {
    pcorr: r,
    statistic: t,
    pValue,
    rejected: pValue <= alpha,
    alpha,
    print: function () {
      return `Pearson correlation: ${r.toFixed(4)}\np-value: ${pValue.toExponential(4)}\nt-statistic: ${t.toFixed(4)}\nalpha: ${alpha}\nalternative: ${alternative}\nnull hypothesis rejected: ${pValue <= alpha}\n`;
    }
  };
}

/**
 * Calculates the ranks of the input array.
 * Ties are assigned the average rank.
 */
export function rankData(arr: number[]): number[] {
  const n = arr.length;
  // Optimization: use a typed array of indices to avoid allocating `{v, i}` objects
  const indices = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    indices[i] = i;
  }

  // Sort indices based on array values
  indices.sort((a, b) => arr[a] - arr[b]);

  const ranks = new Array(n);

  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n - 1 && arr[indices[j]] === arr[indices[j + 1]]) {
      j++;
    }
    const count = j - i + 1;
    const rankSum = (count * (2 * (i + 1) + (count - 1))) / 2;
    const avgRank = rankSum / count;

    for (let k = i; k <= j; k++) {
      ranks[indices[k]] = avgRank;
    }
    i = j + 1;
  }
  return ranks;
}

export function calculateSpearmanRanked(
  rankedX: number[],
  rankedY: number[],
  options: { alpha: number; alternative: "two-sided" | "less" | "greater" }
) {
  // Spearman correlation is Pearson correlation on ranks
  const result = pcorrtest_manual(rankedX, rankedY, options);
  return {
    ...result,
    print: function () {
      return `Spearman rank correlation: ${result.pcorr.toFixed(4)}\np-value: ${result.pValue.toExponential(4)}\nt-statistic: ${result.statistic === Infinity || result.statistic === -Infinity ? result.statistic : result.statistic.toFixed(4)}\nalpha: ${options.alpha}\nalternative: ${options.alternative}\nnull hypothesis rejected: ${result.rejected}\n`;
    }
  };
}

export function calculateSpearman(
  x: number[],
  y: number[],
  options: { alpha: number; alternative: "two-sided" | "less" | "greater" }
) {
  const rankedX = rankData(x);
  const rankedY = rankData(y);
  return calculateSpearmanRanked(rankedX, rankedY, options);
}

export function calculatePearson(
  x: number[],
  y: number[],
  options: { alpha: number; alternative: "two-sided" | "less" | "greater" }
) {
  return pcorrtest_manual(x, y, options);
}
