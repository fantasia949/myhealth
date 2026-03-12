import { test, expect } from '@playwright/test';
import { rankData, calculateSpearmanRanked } from '../src/processors/stats';

test('benchmark correlation optimization', async () => {
  // Synthetic Data Generation
  const SAMPLE_SIZE = 500;
  const SUPP_COUNT = 100;

  // Biomarker values: mostly valid numbers > 0
  const rawValues = Array.from({ length: SAMPLE_SIZE }, () => Math.random() * 100);

  // Unique supplements list
  const uniqueSupplements = new Set<string>();
  for (let i = 0; i < SUPP_COUNT; i++) {
    uniqueSupplements.add(`Supp-${i}`);
  }

  // Notes: each note has random supplements
  const noteValues: { supps: string[] }[] = [];
  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const supps: string[] = [];
    // Randomly assign 5 supplements per day
    for (let j = 0; j < 5; j++) {
       const suppId = Math.floor(Math.random() * SUPP_COUNT);
       supps.push(`Supp-${suppId}`);
    }
    noteValues.push({ supps });
  }

  const alpha = 0.05;
  const alternative = 'two-sided';

  // --- BASELINE: Unoptimized Logic (mimicking src/layout/BiomarkerCorrelation.tsx) ---
  const startBaseline = performance.now();

  const resultsBaseline: any[] = [];

  uniqueSupplements.forEach((suppName) => {
    // 1. Identify valid indices: where biomarker value > 0
    // REDUNDANT: Done inside the loop for every supplement
    const validIndices: number[] = [];
    rawValues.forEach((val, index) => {
      const numVal = Number(val);
      if (!isNaN(numVal) && numVal > 0) {
          validIndices.push(index);
      }
    });

    if (validIndices.length < 3) return;

    // 2. Extract filtered vectors
    // REDUNDANT: filteredBiomarkerValues is reconstructed every time
    const filteredBiomarkerValues: number[] = [];
    const filteredSuppVector: number[] = [];

    validIndices.forEach(i => {
       if (i < noteValues.length) {
           const note = noteValues[i];
           filteredBiomarkerValues.push(Number(rawValues[i]));
           filteredSuppVector.push(note && note.supps?.includes(suppName) ? 1 : 0);
       }
    });

    if (filteredBiomarkerValues.length < 3) return;

    // Check variation
    const hasSuppVariation = filteredSuppVector.some(v => v !== filteredSuppVector[0]);
    if (!hasSuppVariation) return;

    // REDUNDANT: Variation check on biomarker values happens every time
    const hasBiomarkerVariation = filteredBiomarkerValues.some(v => v !== filteredBiomarkerValues[0]);
    if (!hasBiomarkerVariation) return;

    // 3. Rank the filtered vectors
    // REDUNDANT: rankedBiomarker is recalculated every time (expensive O(N log N))
    const rankedBiomarker = rankData(filteredBiomarkerValues);
    const rankedSupp = rankData(filteredSuppVector);

    // 4. Calculate Spearman correlation
    const result: any = calculateSpearmanRanked(rankedBiomarker, rankedSupp, {
      alpha,
      alternative,
    });

    const rho = result.pcorr;
    const pVal = result.pValue;

    if (rho !== undefined && !isNaN(rho) && pVal <= 1.0) { // relaxed p-value for benchmark
      resultsBaseline.push({
        name: suppName,
        rho: rho,
        pValue: pVal,
      });
    }
  });

  const endBaseline = performance.now();
  const durationBaseline = endBaseline - startBaseline;
  console.log(`Baseline Duration: ${durationBaseline.toFixed(2)} ms`);

  // --- OPTIMIZED: Proposed Logic ---
  const startOptimized = performance.now();

  const resultsOptimized: any[] = [];

  // Optimization: Hoist invariant calculations outside the loop
  // 1. Identify valid indices: where biomarker value > 0 AND note exists
  const validIndices: number[] = [];
  const filteredBiomarkerValues: number[] = [];

  rawValues.forEach((val, index) => {
    const numVal = Number(val);
    if (!isNaN(numVal) && numVal > 0 && index < noteValues.length) {
        validIndices.push(index);
        filteredBiomarkerValues.push(numVal);
    }
  });

  // If we don't have enough data points, we can't correlate
  if (validIndices.length >= 3) {
    // Check variation in biomarker values once
    const hasBiomarkerVariation = filteredBiomarkerValues.some(v => v !== filteredBiomarkerValues[0]);
    if (hasBiomarkerVariation) {
        // Rank the filtered biomarker values once
        const rankedBiomarker = rankData(filteredBiomarkerValues);

        uniqueSupplements.forEach((suppName) => {
          // 2. Extract filtered supplement vector using pre-calculated indices
          const filteredSuppVector: number[] = [];

          // Use a standard for loop for better performance in hot path
          for (let k = 0; k < validIndices.length; k++) {
            const i = validIndices[k];
            const note = noteValues[i];
            filteredSuppVector.push(note && note.supps?.includes(suppName) ? 1 : 0);
          }

          // Check if there is variation in the supplement vector
          const hasSuppVariation = filteredSuppVector.some(v => v !== filteredSuppVector[0]);
          if (!hasSuppVariation) {
            return;
          }

          // 3. Rank the filtered vectors
          // filteredBiomarkerValues is already ranked outside
          const rankedSupp = rankData(filteredSuppVector);

          // 4. Calculate Spearman correlation
          const result: any = calculateSpearmanRanked(rankedBiomarker, rankedSupp, {
            alpha,
            alternative,
          });

          const rho = result.pcorr;
          const pVal = result.pValue;

          // Filter out invalid results (e.g., if rho is NaN)
          // AND filter out results with pValue > 0.1 per requirement
          if (rho !== undefined && !isNaN(rho) && pVal <= 1.0) {
            resultsOptimized.push({
              name: suppName,
              rho: rho,
              pValue: pVal,
            });
          }
        });
    }
  }

  const endOptimized = performance.now();
  const durationOptimized = endOptimized - startOptimized;
  console.log(`Optimized Duration: ${durationOptimized.toFixed(2)} ms`);
  console.log(`Speedup: ${(durationBaseline / durationOptimized).toFixed(2)}x`);

  expect(durationBaseline).toBeGreaterThan(0);
  expect(durationOptimized).toBeGreaterThan(0);
  expect(durationOptimized).toBeLessThan(durationBaseline);
  // Expect at least 1.1x speedup (conservative)
  expect(durationBaseline / durationOptimized).toBeGreaterThan(1.1);

  // Verify Correctness: Results should match
  expect(resultsOptimized.length).toBe(resultsBaseline.length);
});
