import { memo, useMemo } from 'react'
import ReactECharts, { EChartsReactProps } from 'echarts-for-react'
import { CHART_PALETTE } from './Chart2'
import type { EChartsOption } from 'echarts'

interface CorrelationVolcanoPlotProps {
  correlations: Array<[string, number, number, number]> // name, N, pValue, coeff
  alpha: number
}

export default memo(({ correlations, alpha }: CorrelationVolcanoPlotProps) => {
  const options = useMemo<EChartsOption & Pick<EChartsReactProps, 'style' | 'theme'>>(() => {
    // Optimization: Replace Array.map() with a classic for-loop and dense array push
    // to avoid closure allocation and function call overhead for each element.
    const data = []
    for (let i = 0; i < correlations.length; i++) {
      const c = correlations[i]
      const name = c[0]
      const pValue = c[2]
      const coeff = c[3]
      const logPValue = pValue === 0 ? 10 : -Math.log10(pValue) // cap to avoid Infinity if exact 0

      let color = '#888888' // Default Gray for insignificant

      if (pValue <= alpha) {
        if (coeff > 0) {
          color = CHART_PALETTE[7] // Blue for positive significant
        } else if (coeff < 0) {
          color = CHART_PALETTE[0] // Red for negative significant
        }
      }

      data.push({
        value: [coeff, logPValue, pValue, name],
        itemStyle: { color }
      })
    }

    const alphaThreshold = -Math.log10(alpha)

    return {
      style: { height: 400, width: '100%' },
      theme: 'dark',
      backgroundColor: 'transparent',
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const p = params.data.value
          return `${p[3]}<br/>Correlation: <strong>${p[0].toFixed(4)}</strong><br/>P-Value: <strong>${p[2].toExponential(2)}</strong>`
        },
      },
      xAxis: {
        name: 'Correlation Coefficient (Effect Size)',
        nameLocation: 'middle',
        nameGap: 30,
        type: 'value',
        min: -1,
        max: 1,
        splitLine: {
          lineStyle: { color: '#333', type: 'dashed' },
        },
      },
      yAxis: {
        name: '-log10(p-value) (Significance)',
        nameLocation: 'middle',
        nameGap: 40,
        type: 'value',
        splitLine: {
          lineStyle: { color: '#333', type: 'dashed' },
        },
      },
      series: [
        {
          type: 'scatter',
          data: data,
          symbolSize: 8,
          markLine: {
            silent: true,
            lineStyle: { type: 'dashed', color: '#ccc' },
            data: [
              { xAxis: 0, label: { formatter: ' ' } },
              { yAxis: alphaThreshold, label: { formatter: `alpha=${alpha}` } },
            ],
          },
        },
      ],
    }
  }, [correlations, alpha])

  if (correlations.length === 0) return null

  // @ts-ignore
  return <ReactECharts option={options} style={options.style} theme="dark" notMerge={true} />
})
