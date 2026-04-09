import { memo, useRef, useEffect, useMemo } from 'react'
import { ChartProvider, ChartContext } from '@echarts-readymade/core'
import { Line } from '@echarts-readymade/line'
import { labels } from '../data'
import { BioMarker } from '../types/biomarker'
import { CHART_PALETTE } from './Chart2'

interface ChartProps {
  data: BioMarker[]
  keys: string[]
}

const dimension = [
  {
    fieldKey: 'd1',
    fieldName: 'date',
  },
]

const echartsOptions: any = {
  style: { height: 400 },
  theme: 'dark',
  option: {
    color: CHART_PALETTE,
    grid: { top: 40, bottom: 20 },
    backgroundColor: 'transparent',
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

        let tooltipStr = `${pArray[0].value.d1}`
        let hasValidValues = false

        pArray.forEach((p) => {
          const dimName = p.dimensionNames[p.encode.y[0]]
          const val = p.value[dimName]

          if (
            val !== '-' &&
            val !== '' &&
            val !== 'NaN' &&
            val !== null &&
            val !== undefined &&
            !Number.isNaN(val)
          ) {
            tooltipStr += `<br/>${p.marker} ${p.seriesName}: <strong>${val}</strong>`
            hasValidValues = true
          }
        })

        return hasValidValues ? tooltipStr : ''
      },
    },
  },
}

const formatTime = (label: string) => {
  if (!label || label.length < 6) return label
  return `20${label.slice(0, 2)}/${label.slice(2, 4)}/${label.slice(4, 6)}`
}

export default memo(({ data, keys }: ChartProps) => {
  console.log(data, keys)

  const valueList = useMemo(() => {
    // Optimization: Wrap with useMemo to prevent creating a new array reference every render,
    // which invalidates the downstream chartData useMemo dependency check.
    return keys.map((k, i) => ({
      fieldKey: 'v' + i,
      fieldName: k,
      decimalLength: 2,
      yAxisIndex: i,
    }))
  }, [keys])

  const yAxis: any[] = useMemo(() => {
    // Optimization: Replace array map in the render loop with a classic for-loop
    // and pre-allocated array to avoid closure and garbage collection overhead.
    const numKeys = keys.length
    // eslint-disable-next-line eslint-plugin-unicorn/no-new-array
    const result = new Array(numKeys)
    for (let i = 0; i < numKeys; i++) {
      result[i] = {
        scale: true,
        name: keys[i],
      }
    }
    return result
  }, [keys])

  const chartData = useMemo(() => {
    // Optimization: use a local O(1) map for data lookups instead of O(N) array.find inside a map.
    // This reduces lookup complexity from O(N*K) to O(N + K).
    const dataMap = new Map()
    for (let i = 0; i < data.length; i++) {
      dataMap.set(data[i][0], data[i])
    }

    // Optimization: Replace chained .reduce(), .forEach() and Object.values() with a
    // single-pass loop over the data length. This eliminates closure creation, higher-order
    // array method overhead, and repetitive dictionary allocations per render.
    const validSeries = []
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const entry = dataMap.get(key)
      if (entry) {
        const k = valueList.find((entry) => entry.fieldName === key)
        if (k) {
          validSeries.push({ fieldKey: k.fieldKey, values: entry[1] })
        }
      }
    }

    const len = labels.length
    // eslint-disable-next-line eslint-plugin-unicorn(no-new-array)
    const result = new Array(len)
    for (let i = 0; i < len; i++) {
      const item: Record<string, any> = { d1: formatTime(labels[i]) }
      for (let j = 0; j < validSeries.length; j++) {
        const series = validSeries[j]
        const v = series.values[i]
        item[series.fieldKey] = v !== null && v !== undefined ? v : '-'
      }
      result[i] = item
    }

    return result
  }, [data, keys, valueList, labels])

  const ref = useRef<any>(null)

  useEffect(() => {
    let instance: any = null
    if (ref.current) {
      instance = ref.current.getEchartsInstance()
      if (instance) {
        instance.setOption(
          {
            yAxis,
            grid: { top: 40, bottom: 20 },
            series: keys.map(() => ({
              type: 'line',
              connectNulls: false,
            })),
          },
          { notMerge: true },
        )
      }
    }
    return () => {
      if (instance) {
        instance.destroy()
      }
    }
  }, [ref.current, keys, yAxis])

  return (
    <ChartProvider data={chartData} echartsOptions={echartsOptions}>
      <Line
        ref={ref}
        // Note: here you need pass context down
        context={ChartContext}
        dimension={dimension}
        valueList={valueList}
      />
    </ChartProvider>
  )
})
