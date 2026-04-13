import { memo, useRef, useEffect, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { dataMapAtom } from '../atom/dataAtom'
import { ChartProvider, ChartContext } from '@echarts-readymade/core'
import { Line } from '@echarts-readymade/line'
import { labels } from '../data'
import { CHART_PALETTE } from './Chart2'

interface ChartProps {
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
          const unit = p.value[`${dimName}_unit`] || ''

          if (
            val !== '-' &&
            val !== '' &&
            val !== 'NaN' &&
            val !== null &&
            val !== undefined &&
            !Number.isNaN(val)
          ) {
            tooltipStr += `<br/>${p.marker} ${p.seriesName}: <strong>${val} ${unit}</strong>`
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

export default memo(({ keys }: ChartProps) => {
  const dataMap = useAtomValue(dataMapAtom)

  const valueList = useMemo(() => {
    // Optimization: Wrap with useMemo to prevent creating a new array reference every render,
    // which invalidates the downstream chartData useMemo dependency check.
    // Replace chained array map with a pre-allocated array and a classic for-loop
    const len = keys.length
    const result = new Array(len)
    for (let i = 0; i < len; i++) {
      result[i] = {
        fieldKey: 'v' + i,
        fieldName: keys[i],
        decimalLength: 2,
        yAxisIndex: i,
      }
    }
    return result
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
    // Optimization: Replace chained .reduce(), .forEach() and Object.values() with a
    // single-pass loop over the data length. This eliminates closure creation, higher-order
    // array method overhead, and repetitive dictionary allocations per render.
    const validSeries = []
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const entry = dataMap.get(key)
      if (entry) {
        // Optimization: Replace O(N) Array.find() with O(1) direct array indexing.
        // valueList is generated directly from keys, so their indices perfectly align.
        const k = valueList[i]
        if (k && k.fieldName === key) {
          validSeries.push({ fieldKey: k.fieldKey, values: entry[1], unit: entry[2] })
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
        item[`${series.fieldKey}_unit`] = series.unit || ''
      }
      result[i] = item
    }

    return result
  }, [dataMap, keys, valueList, labels])

  const ref = useRef<any>(null)

  useEffect(() => {
    let instance: any = null
    if (ref.current) {
      instance = ref.current.getEchartsInstance()
      if (instance) {
        // Optimization: Replace array map in the render loop with a classic for-loop
        // and pre-allocated array to avoid closure and garbage collection overhead.
        const len = keys.length
        const series = new Array(len)
        for (let i = 0; i < len; i++) {
          series[i] = {
            type: 'line',
            connectNulls: false,
          }
        }
        instance.setOption(
          {
            yAxis,
            grid: { top: 40, bottom: 20 },
            series,
          },
          { replaceMerge: ['series', 'yAxis'], notMerge: true },
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
