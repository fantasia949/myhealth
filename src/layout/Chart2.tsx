import { memo, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { dataMapAtom } from '../atom/dataAtom'

import { labels, formattedLabels } from '../data'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import * as ecStat from 'echarts-stat'
import { ChartProps } from './Chart.types'

echarts.registerTransform((ecStat as any).transform.regression)

export const CHART_PALETTE = [
  '#c23531',
  '#ADD4EF',
  '#BFDAA7',
  '#FCAC65',
  '#C6C1D2',
  '#7598E4',
  '#CF6D6C',
  '#4979CF',
  '#E1934B',
  '#829649',
  '#7D70AC',
  '#2559B7',
]

const echartsOptions: any = {
  style: { height: 400, maxWidth: 800 },
  theme: 'dark',
  backgroundColor: 'transparent',
  color: CHART_PALETTE,
  colorBy: 'series',
  xAxis: [
    {
      type: 'value',
      show: true,
      scale: true,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
  ],
  yAxis: [
    {
      show: true,
      type: 'value',
      scale: true,
      splitLine: { lineStyle: { color: '#3a3a3a80', type: 'dashed', width: 1 } },
    },
    {
      show: false,
      type: 'value',
      name: '',
    },
  ],
  tooltip: {
    triggerOn: 'mousemove',
    backgroundColor: '#111111',
    borderColor: '#3a3a3a80',
    textStyle: {
      color: '#f0f0f0',
    },
    formatter: (params: any) => {
      // Return custom formatted string for scatter data points
      if (params.seriesType === 'scatter' && params.value && params.value.length >= 3) {
        // value[0] is X, value[1] is Y, value[2] is Date string, value[3] is Unit 1, value[4] is Unit 2
        const [x, y, date, unitX, unitY] = params.value

        if (
          x === null ||
          x === undefined ||
          x === 'NaN' ||
          Number.isNaN(x) ||
          y === null ||
          y === undefined ||
          y === 'NaN' ||
          Number.isNaN(y)
        ) {
          return ''
        }

        const dispX = unitX ? `${x} ${unitX}` : x
        const dispY = unitY ? `${y} ${unitY}` : y
        return `${date}<br/><strong>${params.dimensionNames[0]}:</strong> ${dispX}<br/><strong>${params.dimensionNames[1]}:</strong> ${dispY}`
      }
      return params.name || params.seriesName || ''
    },
  },
  grid: {
    top: 40,
    bottom: 40,
  },
  series: [
    {
      type: 'scatter',
      symbolSize: 40,
      legendHoverLink: true,
      large: false,
      zIndex: 2,
    },
    {
      type: 'line',
      symbol: 'circle',
      zIndex: -1,
      showSymbol: false,
      lineStyle: {
        color: '#5470C688',
        width: 64,
      },
      legendHoverLink: true,
      markPoint: {
        itemStyle: {
          normal: {
            color: 'transparent',
          },
        },
        label: {
          normal: {
            show: true,
            textStyle: {
              color: '#f0f0f0',
              fontSize: 14,
            },
          },
        },
      },
    },
  ],
}

export default memo(({ keys }: ChartProps) => {
  const dataMap = useAtomValue(dataMapAtom)

  const mappedScatterData = useMemo(() => {
    // Optimization: Replace O(K*N) chained .map(), .reduce(), and .filter() array allocations
    // with a single-pass O(N) loop to eliminate closure creation and garbage collection overhead.
    const entry0 = dataMap.get(keys[0])
    const entry1 = dataMap.get(keys[1])

    if (entry0 && entry1) {
      const values0 = entry0[1]
      const values1 = entry1[1]
      const unitX = entry0[2] || ''
      const unitY = entry1[2] || ''
      const len = labels.length

      const mappedData = Array<any[]>(len)
      let count = 0

      for (let i = 0; i < len; i++) {
        const v0 = values0[i]
        const v1 = values1[i]
        if (v0 !== null && v0 !== undefined && v1 !== null && v1 !== undefined) {
          const formattedDate = formattedLabels[i]
          mappedData[count++] = [v0, v1, formattedDate, unitX, unitY]
        }
      }
      return { data: mappedData.slice(0, count) }
    }

    return { data: [] }
  }, [dataMap, keys])

  const options: any = useMemo(() => {
    const { series, yAxis, xAxis } = echartsOptions

    const nextXAxis = [{ ...xAxis[0], name: keys[0] }, ...xAxis.slice(1)]
    const nextYAxis = [{ ...yAxis[0], name: keys[1] }, ...yAxis.slice(1)]

    const dataset: any[] = [
      {
        dimensions: [keys[0], keys[1], 'Date', 'unitX', 'unitY'],
        source: mappedScatterData.data,
      },
    ]

    let regressionExpression = ''

    // Guard against regression transform crash on <2 points
    if (mappedScatterData.data.length >= 2) {
      const regRes = (ecStat as any).regression('linear', mappedScatterData.data)
      regressionExpression = regRes.expression

      dataset.push({
        transform: {
          type: 'ecStat:regression',
          config: { method: 'linear', formulaOn: 'end' },
        },
        fromDatasetIndex: 0,
      })
    }

    const nextSeries = [
      series[0],
      // Only include the regression series if dataset contains it
      ...(mappedScatterData.data.length >= 2
        ? [
            {
              ...series[1],
              datasetIndex: 1,
              tooltip: {
                formatter: () => {
                  return `<strong>Regression Trend</strong>${regressionExpression ? `<br/>${regressionExpression}` : ''}`
                },
              },
            },
          ]
        : []),
    ]

    return {
      ...echartsOptions,
      xAxis: nextXAxis,
      yAxis: nextYAxis,
      tooltip: {
        ...echartsOptions.tooltip,
        formatter: (params: any) => {
          if (params.seriesType === 'scatter') {
            if (!params.value) return ''
            const val1 = params.value[0]
            const val2 = params.value[1]

            if (
              val1 === null ||
              val1 === undefined ||
              val1 === 'NaN' ||
              Number.isNaN(val1) ||
              val2 === null ||
              val2 === undefined ||
              val2 === 'NaN' ||
              Number.isNaN(val2)
            ) {
              return ''
            }

            const dateStr = params.value[2]
            const u0 = params.value[3] ? ` ${params.value[3]}` : ''
            const u1 = params.value[4] ? ` ${params.value[4]}` : ''
            return (
              `<strong>${dateStr}</strong><br/>` +
              `${params.marker} ${keys[0]}: <strong>${val1}${u0}</strong><br/>` +
              `${params.marker} ${keys[1]}: <strong>${val2}${u1}</strong>`
            )
          }
          return `<strong>Regression Trend</strong>${regressionExpression ? `<br/>${regressionExpression}` : ''}`
        },
      },
      dataset,
      series: nextSeries,
    }
  }, [mappedScatterData, keys])

  // console.log("ch2", options.series[0].data, options.series[1].data);

  return (
    <div>
      <ReactECharts option={options} style={options.style} notMerge={true} theme="dark" />
    </div>
  )
})
