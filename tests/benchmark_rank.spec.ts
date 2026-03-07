import { test } from '@playwright/test';
import { rankData } from '../src/processors/stats';

test('benchmark rankData', async () => {
  const n = 10000;
  const arr = new Array(n);
  for(let i=0; i<n; i++) arr[i] = Math.random();

  const start1 = performance.now();
  for(let i=0; i<1000; i++) {
    rankData(arr);
  }
  console.log('Original: ', performance.now() - start1);
});
