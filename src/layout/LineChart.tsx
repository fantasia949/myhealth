import React, { memo } from 'react'
import ReactECharts from 'echarts-for-react'
import { labels, formattedLabels } from '../data'
import { CHART_PALETTE } from './Chart2'
import type { LineChartProps } from './LineChart.types'

const echartsOptions = {
  style: { height: 300, width: '100%' },
  theme: 'dark',
  backgroundColor: 'transparent',
  color: CHART_PALETTE,
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
      if (
        !p ||
        p.value[1] === '-' ||
        p.value[1] === '' ||
        p.value[1] === 'NaN' ||
        p.value[1] === null ||
        p.value[1] === undefined ||
        Number.isNaN(p.value[1])
      ) {
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

import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { dataMapAtom } from '../atom/dataAtom'

export default memo(({ name, values, rangeStr }: LineChartProps) => {
  const dataMap = useAtomValue(dataMapAtom)
  const unit = dataMap.get(name)?.[2] || ''

  // Map null/undefined values to '-' and pair them with labels
  // Preserving missing points prevents misrepresenting data gaps (connectNulls: false by default)
  const data = useMemo(() => {
    // Optimization: Replace array map in the render loop with a pre-allocated array.
    // Also, wrap in useMemo so that the date formatting isn't re-run unneccessarily when
    // other props (like rangeStr or parent component states) trigger a re-render.
    const numLabels = labels.length
    const result = Array<[string, number | string]>(numLabels)
    for (let i = 0; i < numLabels; i++) {
      const value = values[i]
      result[i] = [formattedLabels[i], value !== null && value !== undefined ? value : '-']
    }
    return result
  }, [values])

  const options = useMemo(() => {
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

      const validMin = min !== undefined && !Number.isNaN(min)
      const validMax = max !== undefined && !Number.isNaN(max)

      if (validMin || validMax) {
        markArea = {
          itemStyle: {
            color: 'rgba(84, 112, 198, 0.1)',
          },
          data: [
            [
              {
                yAxis: validMin ? min : 'min',
              },
              {
                yAxis: validMax ? max : 'max',
              },
            ],
          ],
        }
      }
    }

    return {
      ...echartsOptions,
      tooltip: {
        ...echartsOptions.tooltip,
        formatter: (params: any) => {
          // ECharts axis trigger passes an array of series data for that axis index
          const p = Array.isArray(params) ? params[0] : params
          if (
            !p ||
            !p.value ||
            p.value[1] === '-' ||
            p.value[1] === '' ||
            p.value[1] === 'NaN' ||
            p.value[1] === null ||
            p.value[1] === undefined ||
            Number.isNaN(p.value[1])
          ) {
            return ''
          }
          const unitStr = unit ? ` ${unit}` : ''
          return `${p.seriesName}<br/>${p.value[0]}<br/><strong>${p.value[1]}${unitStr}</strong>`
        },
      },
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
  }, [rangeStr, name, data, unit])

  return <ReactECharts option={options} style={echartsOptions.style} notMerge={true} theme="dark" />
})
