import React, { memo, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { labels, formattedLabels } from '../data'
import { CHART_PALETTE } from './Chart2'

interface InferredValidationChartProps {
  name: string
  values: number[]
  originValues?: (string | number | null)[]
}

const echartsOptions = {
  style: { height: 350, width: '100%' },
  theme: 'dark',
  backgroundColor: 'transparent',
  color: [CHART_PALETTE[0], CHART_PALETTE[1]], // primary and secondary colors
  animation: false,
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#111111',
    borderColor: '#3a3a3a80',
    textStyle: {
      color: '#f0f0f0',
    },
    formatter: (params: any) => {
      let result = ''
      for (const p of params) {
        if (
          !p ||
          p.value[1] === '-' ||
          p.value[1] === '' ||
          p.value[1] === 'NaN' ||
          p.value[1] === null ||
          p.value[1] === undefined ||
          Number.isNaN(p.value[1])
        ) {
          continue
        }
        if (!result) result = `${p.value[0]}<br/>`
        result += `${p.marker} ${p.seriesName}: <strong>${p.value[1]}</strong><br/>`
      }
      return result
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  legend: {
    data: ['Inferred (Formula)', 'Measured (Raw)'],
    textStyle: {
      color: '#ccc',
    },
  },
  xAxis: {
    type: 'time',
    boundaryGap: false,
  },
  yAxis: {
    type: 'value',
    scale: true,
  },
}

export default memo(({ name, values, originValues }: InferredValidationChartProps) => {
  const [inferredData, measuredData] = useMemo(() => {
    const numLabels = labels.length
    const inferred = Array<[string, number | string]>(numLabels)
    const measured = Array<[string, number | string]>(numLabels)

    for (let i = 0; i < numLabels; i++) {
      const val = values[i]
      const originVal = originValues?.[i]

      inferred[i] = [formattedLabels[i], val !== null && val !== undefined ? val : '-']

      let finalOriginVal: number | string = '-'
      if (originVal !== null && originVal !== undefined) {
        const parsed = typeof originVal === 'string' ? parseFloat(originVal.replace(/[^0-9.-]/g, '')) : originVal
        if (!Number.isNaN(parsed)) {
          finalOriginVal = parsed
        }
      }
      measured[i] = [formattedLabels[i], finalOriginVal]
    }

    return [inferred, measured]
  }, [values, originValues])

  const options = useMemo(() => {
    return {
      ...echartsOptions,
      title: {
        text: `${name} Divergence: Measured vs Inferred`,
        left: 'center',
        textStyle: {
          color: '#ccc',
        },
      },
      series: [
        {
          name: 'Inferred (Formula)',
          type: 'line',
          data: inferredData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3,
            type: 'dashed'
          }
        },
        {
          name: 'Measured (Raw)',
          type: 'line',
          data: measuredData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3
          }
        },
      ],
    }
  }, [name, inferredData, measuredData])

  return <ReactECharts option={options} style={echartsOptions.style} notMerge={true} theme="dark" />
})
