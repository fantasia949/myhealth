import React, { memo } from 'react'
import ReactECharts from 'echarts-for-react'
import { labels } from '../data'

interface LineChartProps {
  name: string
  values: number[]
  rangeStr?: string
}

const echartsOptions = {
  style: { height: 300, width: '100%' },
  theme: 'dark',
  backgroundColor: 'transparent',
  animation: false,
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#111111',
    borderColor: '#3a3a3a80',
    textStyle: {
      color: '#f0f0f0',
    },
    formatter: (params: any) => {
      // ECharts axis trigger passes an array of series data for that axis index
      const p = Array.isArray(params) ? params[0] : params
      if (!p || p.value[1] === '-' || p.value[1] === null || p.value[1] === undefined) {
        return ''
      }
      return `${p.seriesName}<br/>${p.value[0]}<br/><strong>${p.value[1]}</strong>`
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'time',
    boundaryGap: false,
  },
  yAxis: {
    type: 'value',
    scale: true, // This makes the axis adjust to the data range
  },
}

const formatTime = (label: string) => {
  if (!label || label.length < 6) return label
  return `20${label.slice(0, 2)}/${label.slice(2, 4)}/${label.slice(4, 6)}`
}

export default memo(({ name, values, rangeStr }: LineChartProps) => {
  // Map null/undefined values to '-' and pair them with labels
  // Preserving missing points prevents misrepresenting data gaps (connectNulls: false by default)
  const data = values.map((value, index) => {
    return [formatTime(labels[index]), value !== null && value !== undefined ? value : '-']
  })

  let markArea: any = undefined

  if (rangeStr) {
    let min: number | undefined
    let max: number | undefined

    if (rangeStr.includes(' - ')) {
      const parts = rangeStr.split(' - ')
      min = parseFloat(parts[0])
      max = parseFloat(parts[1])
    } else if (rangeStr.startsWith('>=')) {
      min = parseFloat(rangeStr.slice(2))
    } else if (rangeStr.startsWith('<=')) {
      max = parseFloat(rangeStr.slice(2))
    }

    if (min !== undefined || max !== undefined) {
      markArea = {
        itemStyle: {
          color: 'rgba(84, 112, 198, 0.1)',
        },
        data: [
          [
            {
              yAxis: min !== undefined && !isNaN(min) ? min : undefined,
            },
            {
              yAxis: max !== undefined && !isNaN(max) ? max : undefined,
            },
          ],
        ],
      }
    }
  }

  const options = {
    ...echartsOptions,
    title: {
      text: name,
      left: 'center',
      textStyle: {
        color: '#ccc',
      },
    },
    series: [
      {
        name: name,
        type: 'line',
        data: data,
        smooth: true, // Make the line smooth
        symbol: 'circle',
        symbolSize: 6,
        markArea: markArea,
      },
    ],
  }

  return <ReactECharts option={options} style={echartsOptions.style} />
})
