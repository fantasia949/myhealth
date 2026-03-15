import pcorrtest from '@stdlib/stats-pcorrtest'

const calculatePearsonValue = (x: number[], y: number[]) => {
  const n = x.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  let sumY2 = 0

  for (let i = 0; i < n; i++) {
    const xi = x[i]
    const yi = y[i]
    sumX += xi
    sumY += yi
    sumXY += xi * yi
    sumX2 += xi * xi
    sumY2 += yi * yi
  }

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) return 0

  // Clamp r to [-1, 1] to avoid NaN due to floating point inaccuracies
  let r = numerator / denominator
  if (r > 1) return 1
  if (r < -1) return -1
  return r
}

// ... existing code ...

function pcorrtest_manual(
  x: number[],
  y: number[],
  options?: { alpha?: number; alternative?: 'two-sided' | 'less' | 'greater' },
) {
  const alpha = options?.alpha ?? 0.05
  const alternative = options?.alternative ?? 'two-sided'
  const n = x.length
  const r = calculatePearsonValue(x, y)

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
