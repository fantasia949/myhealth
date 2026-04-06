import { memo, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { BioMarker } from '../types/biomarker'
import { labels } from '../data'
import { CHART_PALETTE } from './Chart2'

interface ScatterChartProps {
  data: BioMarker[]
  keys: string[]
}

const echartsOptions = {
  style: { height: 400 },
  theme: 'dark',
  backgroundColor: 'transparent',
  color: CHART_PALETTE,
  xAxis: {
    type: 'time',
  },
  yAxis: [] as any[],
  series: [] as any[],
  tooltip: {
    trigger: 'item',
    backgroundColor: '#111111',
    borderColor: '#3a3a3a80',
    textStyle: {
      color: '#f0f0f0',
    },
    formatter: (params: any) => {
      const date = params.value[0]
      const value =
        params.value[1] !== null && params.value[1] !== undefined ? params.value[1] : '-'
      const unit = params.value[2] ? ` ${params.value[2]}` : ''
      return `${params.marker} ${params.seriesName}<br/>${date}<br/><strong>${value}${unit}</strong>`
    },
  },
  legend: {
    data: [] as string[],
  },
  grid: {
    right: 40,
    left: 80,
  },
}

export default memo(({ data, keys }: ScatterChartProps) => {
  const yAxes = keys.map((key, index) => {
    const isEven = index % 2 === 0
    const sideOffset = Math.floor(index / 2) * 80

    return {
      type: 'value',
      name: key,
      position: isEven ? 'left' : 'right',
      offset: sideOffset,
      nameLocation: 'middle',
      nameGap: 50,
      axisLine: {
        show: true,
        lineStyle: {
          color: CHART_PALETTE[index % CHART_PALETTE.length],
        },
      },
      axisLabel: {
        formatter: '{value}',
      },
      min: 'dataMin',
    }
  })

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

    // Optimization: Replace chained Array.map() with a classic for-loop and pre-allocated array.
    // This eliminates the closure allocation and avoids garbage collection spikes in component render paths.
    const numKeys = keys.length
    // eslint-disable-next-line eslint-plugin-unicorn/no-new-array
    const result = new Array(numKeys)
    for (let k = 0; k < numKeys; k++) {
      const key = keys[k]
      const bioMarker = dataMap.get(key)

      if (!bioMarker) {
        result[k] = {
          name: key,
          type: 'scatter',
          yAxisIndex: k,
          data: [],
        }
        continue
      }

      const values = bioMarker[1]
      const unit = bioMarker[2]
      const validData = []

      const numLabels = labels.length
      // Assuming labels length matches values length
      for (let i = 0; i < numLabels; i++) {
        const val = values[i]
        if (val !== null && val !== undefined) {
          validData.push([formatTime(labels[i]), val, unit])
        }
      }

      result[k] = {
        name: key,
        type: 'scatter',
        yAxisIndex: k,
        data: validData,
      }
    }
    return result
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
      left: Math.ceil(keys.length / 2) * 80,
      right: Math.max(Math.floor(keys.length / 2) * 80, 40),
    },
  }

  return <ReactECharts option={options} style={options.style} notMerge={true} theme="dark" />
})
