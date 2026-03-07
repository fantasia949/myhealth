import { test, expect } from '@playwright/test';
import { rankData } from '../src/processors/stats';

function rankBinaryData(arr: number[]): number[] {
  const n = arr.length;
  let zeros = 0;
  for (let i = 0; i < n; i++) {
    if (arr[i] === 0) zeros++;
  }
  const rank0 = (zeros + 1) / 2;
  const rank1 = (zeros + 1 + n) / 2;
  const ranks = new Array(n);
  for (let i = 0; i < n; i++) {
    ranks[i] = arr[i] === 0 ? rank0 : rank1;
  }
  return ranks;
}

test('benchmark binary rank', () => {
  const arr = Array.from({ length: 1000 }, () => Math.random() > 0.5 ? 1 : 0);

  // warmup
  for (let i = 0; i < 100; i++) {
    rankData(arr);
    rankBinaryData(arr);
  }

  const start1 = performance.now();
  for (let i = 0; i < 10000; i++) {
    rankData(arr);
  }
  const duration1 = performance.now() - start1;

  const start2 = performance.now();
  for (let i = 0; i < 10000; i++) {
    rankBinaryData(arr);
  }
  const duration2 = performance.now() - start2;

  console.log(`rankData: ${duration1.toFixed(2)}ms`);
  console.log(`rankBinaryData: ${duration2.toFixed(2)}ms`);
  expect(rankData(arr)).toEqual(rankBinaryData(arr));
});
