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

          if (val !== '-' && val !== null && val !== undefined) {
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
  const valueList = keys.map((k, i) => ({
    fieldKey: 'v' + i,
    fieldName: k,
    decimalLength: 2,
    yAxisIndex: i,
  }))

  console.log(data, keys)

  const yAxis: any[] = useMemo(
    () =>
      keys.map((k) => ({
        scale: true,
        name: k,
      })),
    [keys],
  )

  const chartData = useMemo(() => {
    // Optimization: use a local O(1) map for data lookups instead of O(N) array.find inside a map.
    // This reduces lookup complexity from O(N*K) to O(N + K).
    const dataMap = new Map()
    for (let i = 0; i < data.length; i++) {
      dataMap.set(data[i][0], data[i])
    }

    const dict = keys.reduce((result: Record<number, any>, key) => {
      const entry = dataMap.get(key)
      if (entry) {
        const values = entry[1]
        // Hoist the fieldKey resolution outside the inner loop to avoid O(K * L) overhead
        const k = valueList.find((entry) => entry.fieldName === key)
        if (k) {
          values.forEach((v: number | null, i: number) => {
            if (!result[i]) {
              result[i] = { d1: formatTime(labels[i]) }
            }
            result[i][k.fieldKey] = v !== null && v !== undefined ? v : '-'
          })
        }
      }
      return result
    }, {})

    return Object.values(dict)
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
