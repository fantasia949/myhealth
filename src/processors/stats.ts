import pcorrtest from "@stdlib/stats-pcorrtest";

/**
 * Calculates the ranks of the input array.
 * Ties are assigned the average rank.
 */
export function rankData(arr: number[]): number[] {
  const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Array(arr.length).fill(0);

  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length - 1 && sorted[j].v === sorted[j + 1].v) {
      j++;
    }
    const n = j - i + 1;
    const rankSum = (n * (2 * (i + 1) + (n - 1))) / 2;
    const avgRank = rankSum / n;

    for (let k = i; k <= j; k++) {
      ranks[sorted[k].i] = avgRank;
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
  const result = pcorrtest(rankedX, rankedY, options);
  // Alias pcorr (if present) to rho for consistency
  if (result.pcorr !== undefined && result.rho === undefined) {
    result.rho = result.pcorr;
  }
  return result;
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
