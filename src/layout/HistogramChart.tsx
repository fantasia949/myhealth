import React, { memo, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import * as ecStat from 'echarts-stat'
import { CHART_PALETTE } from './Chart2'

echarts.registerTransform((ecStat as any).transform.histogram)

interface HistogramChartProps {
  name: string
  values: number[]
}

const echartsOptions = {
  style: { height: 300, width: '100%' },
  theme: 'dark',
  color: CHART_PALETTE,
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: '#111111',
    borderColor: '#3a3a3a80',
    textStyle: {
      color: '#f0f0f0',
    },
  },
  grid: {
    left: '10%',
    right: '10%',
    bottom: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    name: 'Value',
    nameLocation: 'middle',
    nameGap: 30,
    scale: true,
  },
  yAxis: {
    type: 'value',
    name: 'Frequency',
  },
}

export default memo(({ name, values }: HistogramChartProps) => {
  const data = useMemo(() => {
    const validData: number[][] = []
    const len = values.length
    for (let i = 0; i < len; i++) {
      const val = values[i]
      if (val !== null && val !== undefined && !Number.isNaN(val)) {
        validData.push([val])
      }
    }
    return validData
  }, [values])

  if (data.length === 0) return null

  const options = {
    ...echartsOptions,
    title: {
      text: `${name} Distribution`,
      left: 'center',
      textStyle: {
        color: '#ccc',
      },
    },
    dataset: [
      {
        source: data,
      },
      {
        transform: {
          type: 'ecStat:histogram',
        },
      },
    ],
    series: [
      {
        name: 'Histogram',
        type: 'bar',
        barWidth: '99.3%',
        label: {
          show: true,
          position: 'top',
        },
        datasetIndex: 1,
        itemStyle: {
          color: CHART_PALETTE[0] + '88',
          borderColor: CHART_PALETTE[0],
        },
        tooltip: {
          formatter: (params: any) => {
            const val = params.value
            // ecStat:histogram dataset format: [mean, count, min, max]
            return `<strong>${name} Range</strong><br/>${val[2].toFixed(2)} - ${val[3].toFixed(2)}<br/>Frequency: ${val[1]}`
          },
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={options}
      style={echartsOptions.style}
      theme="dark"
      opts={{ renderer: 'canvas' }}
    />
  )
})
