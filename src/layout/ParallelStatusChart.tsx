import { memo, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { visibleDataAtom, tagAtom } from '../atom/dataAtom'
import ReactECharts from 'echarts-for-react'
import { CHART_PALETTE } from './Chart2'

export default memo(() => {
  const visibleData = useAtomValue(visibleDataAtom)
  const activeTag = useAtomValue(tagAtom)

  const chartOptions = useMemo(() => {
    if (!activeTag || visibleData.length === 0) {
      return null
    }

    // Optimization: Pre-allocate arrays for parallel axis and data points
    const numMarkers = visibleData.length
    const parallelAxis = Array(numMarkers)
    const currentValues = Array(numMarkers)

    // We only plot the most recent data point (last index)
    const lastIndex = visibleData[0][1].length - 1

    for (let i = 0; i < numMarkers; i++) {
      const bioMarker = visibleData[i]
      const name = bioMarker[0]
      const values = bioMarker[1]
      const extra = bioMarker[3]

      // Extract the most recent valid value, walking backwards if the very last is null
      let latestVal = null
      for (let j = lastIndex; j >= 0; j--) {
        if (values[j] !== null && values[j] !== undefined && !Number.isNaN(values[j])) {
          latestVal = values[j]
          break
        }
      }

      currentValues[i] = latestVal !== null ? latestVal : '-'

      // Parse the extra.range string to define axis boundaries if possible
      let min: number | undefined
      let max: number | undefined

      if (extra && extra.range) {
        if (extra.range.includes(' - ')) {
          const parts = extra.range.split(' - ')
          min = parseFloat(parts[0])
          max = parseFloat(parts[1])
        } else if (extra.range.startsWith('>=')) {
          min = parseFloat(extra.range.slice(2))
        } else if (extra.range.startsWith('<=')) {
          max = parseFloat(extra.range.slice(2))
        }
      }

      const axisDef: any = {
        dim: i,
        name: name,
        nameLocation: 'end',
      }

      if (min !== undefined && !Number.isNaN(min)) {
        axisDef.min = (val: { min: number }) => Math.min(val.min, min! - min! * 0.1)
      }
      if (max !== undefined && !Number.isNaN(max)) {
        axisDef.max = (val: { max: number }) => Math.max(val.max, max! + max! * 0.1)
      }

      parallelAxis[i] = axisDef
    }

    return {
      style: { height: 400, width: '100%' },
      theme: 'dark',
      backgroundColor: 'transparent',
      color: CHART_PALETTE,
      tooltip: {
        trigger: 'item',
        backgroundColor: '#111111',
        borderColor: '#3a3a3a80',
        textStyle: {
          color: '#f0f0f0',
        },
      },
      parallelAxis: parallelAxis,
      parallel: {
        left: '5%',
        right: '13%',
        bottom: '10%',
        top: '20%',
        parallelAxisDefault: {
          type: 'value',
          nameLocation: 'end',
          nameGap: 20,
          nameTextStyle: {
            color: '#f0f0f0',
            fontSize: 12,
          },
          axisLine: {
            lineStyle: {
              color: '#3a3a3a80',
            },
          },
          axisTick: {
            lineStyle: {
              color: '#3a3a3a80',
            },
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            color: '#a0a0a0',
          },
        },
      },
      series: [
        {
          name: 'Latest Status',
          type: 'parallel',
          lineStyle: {
            width: 3,
            color: CHART_PALETTE[0],
            opacity: 0.8,
          },
          data: [currentValues],
        },
      ],
    }
  }, [visibleData, activeTag])

  if (!chartOptions) {
    return null
  }

  return (
    <div className="w-full my-4">
      <ReactECharts option={chartOptions} style={chartOptions.style} notMerge={true} theme="dark" />
    </div>
  )
})
