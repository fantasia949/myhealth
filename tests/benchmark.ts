import pcorrtest from '@stdlib/stats-pcorrtest'


// ... existing code ...

export function pcorrtest_manual(
  x: number[],
  y: number[],
  options?: { alpha?: number; alternative?: 'two-sided' | 'less' | 'greater' },
) {

  // We can calculate the t-statistic threshold corresponding to alpha.
  // Instead of evaluating the CDF to get the exact p-value for every calculation,
  // we can use pcorrtest only when the correlation exceeds the critical t-value,
  // OR we can just use the manual r and then run pcorrtest to get the pValue if needed,
  // but wait, pcorrtest doesn't let us pass r directly.
  // However, we can approximate the p-value calculation by computing the exact threshold.
  // Actually, wait, `pcorrtest(x, y)` has N elements.
  // We can implement a simple student-t CDF approximation. Or if we just fallback to pcorrtest
  // when |r| is large? No, the goal is exact pValues.

  return pcorrtest(x, y, options)
}
