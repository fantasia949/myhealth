import { memo, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { dataMapAtom } from '../atom/dataAtom'
import ReactECharts from 'echarts-for-react'
import type { YAXisComponentOption, ScatterSeriesOption } from 'echarts'
import { labels, formattedLabels } from '../data'
import { CHART_PALETTE } from './Chart2'
import type { ScatterChartProps } from './ScatterChart.types'

const echartsOptions = {
  style: { height: 400 },
  theme: 'dark',
  backgroundColor: 'transparent',
  color: CHART_PALETTE,
  xAxis: {
    type: 'time',
  },
  yAxis: [] as YAXisComponentOption[],
  series: [] as ScatterSeriesOption[],
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

  const yAxes: YAXisComponentOption[] = useMemo(() => {
    const numKeys = keys.length
    const result: YAXisComponentOption[] = []
    for (let index = 0; index < numKeys; index++) {
      const key = keys[index]
      const isEven = index % 2 === 0
      const sideOffset = Math.floor(index / 2) * 100

      result.push({
        type: 'value',
        name: key,
        position: isEven ? 'left' : 'right',
        offset: sideOffset,
        nameLocation: 'middle',
        nameRotate: isEven ? 90 : -90,
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
      })
    }
    return result
  }, [keys])

  const chartData: ScatterSeriesOption[] = useMemo(() => {
    // Optimization: Replace chained Array.map() with a classic for-loop and dense array.
    // This eliminates the closure allocation and avoids garbage collection spikes in component render paths without causing V8 'holey' array issues.
    const numKeys = keys.length
    const result: ScatterSeriesOption[] = []
    for (let k = 0; k < numKeys; k++) {
      const key = keys[k]
      const bioMarker = dataMap.get(key)

      if (!bioMarker) {
        result.push({
          name: key,
          type: 'scatter',
          yAxisIndex: k,
          data: [],
        })
        continue
      }

      const values = bioMarker[1]
      const unit = bioMarker[2]
      const validData: [string, number, string][] = []

      const numLabels = labels.length
      // Assuming labels length matches values length
      for (let i = 0; i < numLabels; i++) {
        const val = values[i]
        if (val !== null && val !== undefined && !Number.isNaN(val as number)) {
          validData.push([formattedLabels[i], val, unit])
        }
      }

      result.push({
        name: key,
        type: 'scatter',
        yAxisIndex: k,
        data: validData,
        symbolSize: 10,
        itemStyle: {
          color: CHART_PALETTE[k % CHART_PALETTE.length],
        },
      })
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
        left: Math.ceil(keys.length / 2) * 100,
        right: Math.max(Math.floor(keys.length / 2) * 100, 40),
      },
    }),
    [yAxes, chartData, keys],
  )

  if (keys.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] w-full text-gray-500 italic border border-dashed border-[#3a3a3a80] rounded-lg">
        No biomarkers selected.
      </div>
    )
  }

  return <ReactECharts option={options} style={options.style} notMerge={true} theme="dark" />
})
