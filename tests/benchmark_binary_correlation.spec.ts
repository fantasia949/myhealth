import { test } from '@playwright/test';
import { rankData, calculateSpearmanRanked } from '../src/processors/stats';

function rankBinaryData(arr: number[]): Float64Array {
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

  const suppVectors = new Map<string, number[]>();
  const supplements: string[] = [];
  for(let s=0; s<numSupplements; s++) {
      const name = `supp_${s}`;
      supplements.push(name);
      const vec = new Array(n);
      for(let i=0; i<n; i++) {
          vec[i] = Math.random() > 0.8 ? 1 : 0;
      }
      suppVectors.set(name, vec);
  }

  const alpha = 0.05;
  const alternative = "two-sided";

  const start1 = performance.now();
  for(let i=0; i<100; i++) {
      supplements.forEach((suppName) => {
          const vec = suppVectors.get(suppName)!;
          const rankedSupp = rankBinaryData(vec) as any as number[];
          calculateSpearmanRanked(rankedBiomarker, rankedSupp, { alpha, alternative });
      });
  }
  console.log('Optimized Spearman: ', performance.now() - start1);
});
