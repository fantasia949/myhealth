import { memo, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { BioMarker } from '../types/biomarker'
import { labels } from '../data'

interface ScatterChartProps {
  data: BioMarker[]
  keys: string[]
}

const echartsOptions = {
  style: { height: 400 },
  theme: 'dark',
  backgroundColor: 'transparent',
  xAxis: {
    type: 'time',
  },
  yAxis: [] as any[],
  series: [] as any[],
  tooltip: {
    trigger: 'item',
  },
  legend: {
    data: [] as string[],
  },
  grid: {
    right: 40,
  },
}

export default memo(({ data, keys }: ScatterChartProps) => {
  const yAxes = keys.map((key, index) => ({
    type: 'value',
    name: key,
    position: 'left',
    offset: index * 80,
    axisLine: {
      show: true,
    },
    axisLabel: {
      formatter: '{value}',
    },
    min: 'dataMin',
  }))

  const formatTime = (label: string) => {
    return `20${label.slice(0, 2)}/${label.slice(2, 4)}/${label.slice(4, 6)}`
  }

  const chartData = useMemo(() => {
    // Optimization: use a local O(1) map for data lookups instead of O(N) array.find inside a map.
    // This reduces lookup complexity from O(N*K) to O(N + K).
    const dataMap = new Map()
    for (let i = 0; i < data.length; i++) {
      dataMap.set(data[i][0], data[i])
    }

    return keys.map((key, index) => {
      const bioMarker = dataMap.get(key)
      return {
        name: key,
        type: 'scatter',
        yAxisIndex: index,
        data: bioMarker ? bioMarker[1].map((value, i) => [formatTime(labels[i]), value]) : [],
      }
    })
  }, [data, keys])

  const options = {
    ...echartsOptions,
    xAxis: {
      ...echartsOptions.xAxis,
    },
    yAxis: yAxes,
    series: chartData,
    legend: {
      ...echartsOptions.legend,
      data: keys,
    },
    grid: {
      right: keys.length * 60,
    },
  }

  return <ReactECharts option={options} style={options.style} />
})
