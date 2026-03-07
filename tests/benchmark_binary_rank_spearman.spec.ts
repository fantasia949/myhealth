import { test, expect } from '@playwright/test';
import { rankData, calculateSpearmanRanked } from '../src/processors/stats';

function calculateSpearmanBinary(
  rankedBiomarker: number[],
  binaryVector: number[],
  options: { alpha: number; alternative: "two-sided" | "less" | "greater" }
) {
  // We can calculate the rank of binaryVector without sorting
  const n = binaryVector.length;
  let count0 = 0;
  for (let i = 0; i < n; i++) {
    if (binaryVector[i] === 0) {
      count0++;
    }
  }

  const rank0 = (count0 + 1) / 2;
  const rank1 = (count0 + 1 + n) / 2;

  const rankedBinary = new Array(n);
  for (let i = 0; i < n; i++) {
    rankedBinary[i] = binaryVector[i] === 0 ? rank0 : rank1;
  }

  return calculateSpearmanRanked(rankedBiomarker, rankedBinary, options);
}

test('benchmark binary rank spearman', () => {
  const n = 1000;
  const biomarker = Array.from({ length: n }, () => Math.random() * 100);
  const binaryVector = Array.from({ length: n }, () => Math.random() > 0.5 ? 1 : 0);

  const rankedBiomarker = rankData(biomarker);
  const options = { alpha: 0.05, alternative: "two-sided" as const };

  // warmup
  for (let i = 0; i < 100; i++) {
    const rankedBinary = rankData(binaryVector);
    calculateSpearmanRanked(rankedBiomarker, rankedBinary, options);
    calculateSpearmanBinary(rankedBiomarker, binaryVector, options);
  }

  const start1 = performance.now();
  for (let i = 0; i < 10000; i++) {
    const rankedBinary = rankData(binaryVector);
    calculateSpearmanRanked(rankedBiomarker, rankedBinary, options);
  }
  const duration1 = performance.now() - start1;

  const start2 = performance.now();
  for (let i = 0; i < 10000; i++) {
    calculateSpearmanBinary(rankedBiomarker, binaryVector, options);
  }
  const duration2 = performance.now() - start2;

  console.log(`original: ${duration1.toFixed(2)}ms`);
  console.log(`optimized: ${duration2.toFixed(2)}ms`);

  const res1 = calculateSpearmanRanked(rankedBiomarker, rankData(binaryVector), options);
  const res2 = calculateSpearmanBinary(rankedBiomarker, binaryVector, options);

  expect(res1.pcorr).toBeCloseTo(res2.pcorr, 5);
  expect(res1.pValue).toBeCloseTo(res2.pValue, 5);
});
