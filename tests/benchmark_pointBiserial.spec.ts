import { test } from '@playwright/test';
import { rankData, calculateSpearmanRanked, calculatePearson } from '../src/processors/stats';

function rankBinaryData(arr: number[] | Int8Array): Float64Array {
  const n = arr.length;
  let count0 = 0;
  for (let i = 0; i < n; i++) {
    if (arr[i] === 0) count0++;
  }
  const count1 = n - count0;

  const rank0 = (count0 + 1) / 2;
  const rank1 = count0 + (count1 + 1) / 2;

  const ranks = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    ranks[i] = arr[i] === 0 ? rank0 : rank1;
  }
  return ranks;
}

test('benchmark Point-Biserial Correlation', async () => {
  const n = 1000;
  const numSupplements = 100;

  const biomarker = new Array(n);
  for(let i=0; i<n; i++) biomarker[i] = Math.random();
  const rankedBiomarker = rankData(biomarker);

  const suppVectors = new Map<string, Int8Array>();
  const supplements: string[] = [];
  for(let s=0; s<numSupplements; s++) {
      const name = `supp_${s}`;
      supplements.push(name);
      const vec = new Int8Array(n);
      for(let i=0; i<n; i++) {
          vec[i] = Math.random() > 0.8 ? 1 : 0;
      }
      suppVectors.set(name, vec);
  }

  const alpha = 0.05;
  const alternative = "two-sided";

  let sumR1 = 0;
  const start1 = performance.now();
  for(let i=0; i<100; i++) {
      supplements.forEach((suppName) => {
          const vec = suppVectors.get(suppName)!;
          const rankedSupp = rankBinaryData(vec);
          const r = calculateSpearmanRanked(rankedBiomarker, rankedSupp, { alpha, alternative });
          sumR1 += r.pcorr;
      });
  }
  console.log('Optimized Spearman: ', performance.now() - start1);

  let sumR2 = 0;
  const start2 = performance.now();
  for(let i=0; i<100; i++) {
      supplements.forEach((suppName) => {
          const vec = suppVectors.get(suppName)!;
          // Point-biserial is mathematically equivalent to Pearson correlation
          // of the ranked continuous variable against the unranked binary variable!
          const r = calculatePearson(rankedBiomarker, vec, { alpha, alternative });
          sumR2 += r.pcorr;
      });
  }
  console.log('Point-Biserial (Pearson on binary): ', performance.now() - start2);

  // ensure they evaluate to roughly the same thing
  console.log('Diff: ', Math.abs(sumR1 - sumR2));
});
