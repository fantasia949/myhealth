import { memo, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { CHART_PALETTE } from './Chart2'

interface FocusedCorrelationChartProps {
  correlations: Array<[string, number, number, number]> // name, N, pValue, coeff
  alpha: number
}

export default memo(({ correlations, alpha }: FocusedCorrelationChartProps) => {
  const options = useMemo(() => {
    // Sort by coefficient (descending) to show strongest positive at top, strongest negative at bottom
    // Optimization: Replace array slicing, spreading, and chained .map() with a classic
    // for-loop to eliminate intermediate allocations, holey arrays, and closure overhead.
    const sorted = [...correlations].sort((a, b) => a[3] - b[3])
    const len = sorted.length
    const isLarge = len > 20
    const displayLen = isLarge ? 20 : len

    const names: string[] = []
    const values: any[] = []

    for (let i = 0; i < displayLen; i++) {
      // If large, take top 10 (indices 0-9) and bottom 10 (indices len-10 to len-1)
      const idx = isLarge && i >= 10 ? len - 20 + i : i
      const c = sorted[idx]

      names.push(c[0])

      // Scale opacity based on how close the pValue is to the chosen alpha threshold
      // Closer to 0 -> 1.0 opacity. Closer to alpha -> 0.3 opacity.
      const ratio = Math.min(1, Math.max(0, c[2] / alpha))
      const opacity = Math.max(0.3, 1 - ratio * 0.7)

      values.push({
        value: c[3],
        itemStyle: {
          color: c[3] > 0 ? CHART_PALETTE[7] : CHART_PALETTE[0], // Blue for positive, Red for negative
          opacity: opacity,
        },
      })
    }

    return {
      style: { height: Math.max(300, displayLen * 30), width: '100%' },
      theme: 'dark',
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = params[0]
          return `${p.name}<br/>Correlation: <strong>${p.value.toFixed(4)}</strong>`
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        min: -1,
        max: 1,
        splitLine: {
          lineStyle: { color: '#333', type: 'dashed' },
        },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: values,
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) => params.value.toFixed(2),
          },
        },
      ],
    }
  }, [correlations, alpha])

  if (correlations.length === 0) return null

  return <ReactECharts option={options} style={options.style} theme="dark" notMerge={true} />
})
