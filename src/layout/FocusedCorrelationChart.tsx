import { memo, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { CHART_PALETTE } from './Chart2'

interface FocusedCorrelationChartProps {
  correlations: Array<[string, number, number, number]> // name, N, pValue, coeff
  alpha: number
}

export default memo(({ correlations, alpha }: FocusedCorrelationChartProps) => {
  const options = useMemo(() => {
    const len = correlations.length
    const isLarge = len > 20
    const displayLen = isLarge ? 20 : len

    // ⚡ Bolt Optimization: Replace O(N log N) full array sort and [...correlations] spread
    // with an O(N) single-pass loop that maintains bounded top/bottom 10 arrays.
    // This significantly reduces time complexity and avoids intermediate array allocations.
    let displayCorrelations: typeof correlations = []

    if (isLarge) {
      const bottom10: typeof correlations = []
      const top10: typeof correlations = []

      for (let i = 0; i < len; i++) {
        const c = correlations[i]
        const coeff = c[3]

        if (bottom10.length < 10 || coeff < bottom10[bottom10.length - 1][3]) {
          let insertIdx = bottom10.length
          for (let j = 0; j < bottom10.length; j++) {
            if (coeff < bottom10[j][3]) {
              insertIdx = j
              break
            }
          }
          bottom10.splice(insertIdx, 0, c)
          if (bottom10.length > 10) {
            bottom10.pop()
          }
        }

        // Check if it should go into top 10 positive (using >= to match stable sort behavior on ties)
        if (top10.length < 10 || coeff >= top10[top10.length - 1][3]) {
          let insertIdx = top10.length
          for (let j = 0; j < top10.length; j++) {
            if (coeff >= top10[j][3]) {
              insertIdx = j
              break
            }
          }
          top10.splice(insertIdx, 0, c)
          if (top10.length > 10) {
            top10.pop()
          }
        }
      }

      for (let i = 0; i < bottom10.length; i++) {
        displayCorrelations.push(bottom10[i])
      }
      for (let i = top10.length - 1; i >= 0; i--) {
        displayCorrelations.push(top10[i])
      }
    } else {
      displayCorrelations = [...correlations].sort((a, b) => a[3] - b[3])
    }

    const names: string[] = []
    const values: any[] = []

    for (let i = 0; i < displayLen; i++) {
      const c = displayCorrelations[i]

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
