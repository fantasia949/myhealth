import { test } from '@playwright/test';
import { rankData } from '../src/processors/stats';

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

test('benchmark rankData vs binary rankData', async () => {
  const n = 1000;
  const arr = new Array(n);
  for(let i=0; i<n; i++) arr[i] = Math.random() > 0.8 ? 1 : 0;

  const start1 = performance.now();
  for(let i=0; i<10000; i++) {
    rankData(arr);
  }
  console.log('Original rankData: ', performance.now() - start1);

  const start2 = performance.now();
  for(let i=0; i<10000; i++) {
    rankBinaryData(arr);
  }
  console.log('Binary rankData: ', performance.now() - start2);

  // Correctness check
  const r1 = rankData(arr);
  const r2 = rankBinaryData(arr);
  let ok = true;
  for(let i=0; i<n; i++) {
    if (r1[i] !== r2[i]) ok = false;
  }
  console.log('Results match:', ok);
});
