import { memo, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { dataMapAtom } from '../atom/dataAtom'
import ReactECharts from 'echarts-for-react'
import { labels, formattedLabels } from '../data'
import { CHART_PALETTE } from './Chart2'

interface ScatterChartProps {
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
    trigger: 'axis',
    backgroundColor: '#111111',
    borderColor: '#3a3a3a80',
    textStyle: {
      color: '#f0f0f0',
    },
    formatter: (params: any) => {
      const pArray = Array.isArray(params) ? params : [params]
      if (pArray.length === 0) return ''

      let title = ''
      for (let i = 0; i < pArray.length; i++) {
        if (pArray[i].value && pArray[i].value[0]) {
          title = pArray[i].value[0]
          break
        }
      }

      if (!title) return ''

      let tooltipStr = `${title}`
      let hasValidValues = false

      for (let i = 0; i < pArray.length; i++) {
        const p = pArray[i]
        if (!p.value) continue
        const val = p.value[1]

        if (
          val !== null &&
          val !== undefined &&
          val !== '-' &&
          val !== '' &&
          val !== 'NaN' &&
          !Number.isNaN(val)
        ) {
          const unit = p.value[2] ? ` ${p.value[2]}` : ''
          tooltipStr += `<br/>${p.marker} ${p.seriesName}: <strong>${val}${unit}</strong>`
          hasValidValues = true
        }
      }

      return hasValidValues ? tooltipStr : ''
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

export default memo(({ keys }: ScatterChartProps) => {
  const dataMap = useAtomValue(dataMapAtom)

  const yAxes = useMemo(() => {
    const numKeys = keys.length
    const result = Array<any>(numKeys)
    for (let index = 0; index < numKeys; index++) {
      const key = keys[index]
      const isEven = index % 2 === 0
      const sideOffset = Math.floor(index / 2) * 80

      result[index] = {
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
        scale: true,
      }
    }
    return result
  }, [keys])

  const chartData = useMemo(() => {
    // Optimization: Replace chained Array.map() with a classic for-loop and pre-allocated array.
    // This eliminates the closure allocation and avoids garbage collection spikes in component render paths.
    const numKeys = keys.length
    const result = Array<any>(numKeys)
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
          validData.push([formattedLabels[i], val, unit])
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
  }, [dataMap, keys])

  const options = useMemo(
    () => ({
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
    }),
    [yAxes, chartData, keys],
  )

  return <ReactECharts option={options} style={options.style} notMerge={true} theme="dark" />
})
