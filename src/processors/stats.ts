import pcorrtest from "@stdlib/stats-pcorrtest";

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
  return pcorrtest(rankedX, rankedY, options);
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
  return pcorrtest(x, y, options);
}
