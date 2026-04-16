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
    // We only take the top 10 and bottom 10 for readability
    const sorted = [...correlations].sort((a, b) => a[3] - b[3])
    const topAndBottom =
      sorted.length > 20 ? [...sorted.slice(0, 10), ...sorted.slice(-10)] : sorted

    const names = topAndBottom.map((c) => c[0])
    const values = topAndBottom.map((c) => {
      // Scale opacity based on how close the pValue is to the chosen alpha threshold
      // Closer to 0 -> 1.0 opacity. Closer to alpha -> 0.3 opacity.
      const ratio = Math.min(1, Math.max(0, c[2] / alpha))
      const opacity = Math.max(0.3, 1 - ratio * 0.7)

      return {
        value: c[3],
        itemStyle: {
          color: c[3] > 0 ? CHART_PALETTE[7] : CHART_PALETTE[0], // Blue for positive, Red for negative
          opacity: opacity,
        },
      }
    })

    return {
      style: { height: Math.max(300, topAndBottom.length * 30), width: '100%' },
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
