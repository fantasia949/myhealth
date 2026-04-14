import { memo, useRef, useEffect, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { dataMapAtom } from '../atom/dataAtom'
import { ChartProvider, ChartContext } from '@echarts-readymade/core'
import { Scatter } from '@echarts-readymade/scatter'
import { labels } from '../data'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import * as ecStat from 'echarts-stat'

echarts.registerTransform((ecStat as any).transform.regression)

interface ChartProps {
  keys: string[]
}

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
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
  ],
  yAxis: [
    {
      show: true,
      type: 'value',
      splitLine: { lineStyle: { color: '#E7EAEF', type: 'dashed', width: 1 } },
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
  dataZoom: [
    {
      type: 'slider',
      show: false,
      xAxisIndex: [0],
      bottom: 30,
    },
    {
      type: 'slider',
      show: false,
      yAxisIndex: [0],
      right: 30,
    },
  ],
  series: [
    {
      type: 'scatter',
      symbolSize: 24,
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
              color: '#333',
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
  const valueList = [
    { fieldKey: keys[0], fieldName: keys[0], decimalLength: 2 },
    { fieldKey: keys[1], fieldName: keys[1], decimalLength: 2 },
  ]

  const dimension = [
    {
      fieldKey: 'date',
      fieldName: 'Date',
    },
    {
      fieldKey: keys[0],
      fieldName: keys[0],
    },
    {
      fieldKey: keys[1],
      fieldName: keys[1],
    },
  ]

  const formatTime = (label: string) => {
    if (!label || label.length < 6) return label
    return `20${label.slice(0, 2)}/${label.slice(2, 4)}/${label.slice(4, 6)}`
  }

  const [scatterData, mappedScatterData] = useMemo(() => {
    // Optimization: Replace O(K*N) chained .map(), .reduce(), and .filter() array allocations
    // with a single-pass O(N) loop to eliminate closure creation and garbage collection overhead.
    const entry0 = dataMap.get(keys[0])
    const entry1 = dataMap.get(keys[1])

    const mappedScatterData: any[][] = []
    const scatterData: Record<string, number | string>[] = []

    if (entry0 && entry1) {
      const values0 = entry0[1]
      const values1 = entry1[1]
      const unitX = entry0[2] || ''
      const unitY = entry1[2] || ''
      const len = labels.length

      for (let i = 0; i < len; i++) {
        const v0 = values0[i]
        const v1 = values1[i]
        if (v0 !== null && v0 !== undefined && v1 !== null && v1 !== undefined) {
          const formattedDate = formatTime(labels[i])

          mappedScatterData.push([v0, v1, formattedDate, unitX, unitY])

          scatterData.push({
            [keys[0]]: v0,
            [keys[1]]: v1,
            date: formattedDate,
          })
        }
      }
    }

    return [scatterData, mappedScatterData]
  }, [dataMap, keys])

  const scatterRef = useRef<any>(null)

  const options: any = useMemo(() => {
    let { series, yAxis, xAxis } = echartsOptions
    ;(xAxis as any[])[0].name = keys[0]
    ;(yAxis as any[])[0].name = keys[1]

    const dataset: any[] = [
      {
        dimensions: [keys[0], keys[1], 'Date', 'unitX', 'unitY'],
        source: mappedScatterData,
      },
    ]

    // Guard against regression transform crash on <2 points
    if (mappedScatterData.length >= 2) {
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
      ...(mappedScatterData.length >= 2
        ? [
            {
              ...series[1],
              datasetIndex: 1,
              tooltip: {
                formatter: (params: any) => {
                  return `<strong>Regression Trend</strong>${params.value[2] ? `<br/>${params.value[2]}` : ''}`
                },
              },
            },
          ]
        : []),
    ]

    // Optimization: Calculate min/max data boundaries in a single O(N) pass
    // to avoid allocating 4 intermediate arrays via chained .map() and
    // preventing stack overflow from spreading (...) large arrays into Math.min/max.
    let minX = 0,
      maxX = 100,
      minY = 0,
      maxY = 100
    if (mappedScatterData.length > 0) {
      minX = mappedScatterData[0][0]
      maxX = mappedScatterData[0][0]
      minY = mappedScatterData[0][1]
      maxY = mappedScatterData[0][1]
      for (let i = 1; i < mappedScatterData.length; i++) {
        const item = mappedScatterData[i]
        if (item[0] < minX) minX = item[0]
        if (item[0] > maxX) maxX = item[0]
        if (item[1] < minY) minY = item[1]
        if (item[1] > maxY) maxY = item[1]
      }
    }

    return {
      ...echartsOptions,
      tooltip: {
        ...echartsOptions.tooltip,
        formatter: (params: any) => {
          if (params.seriesType === 'scatter') {
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
          return `<strong>Regression Trend</strong>${params.value[2] ? `<br/>${params.value[2]}` : ''}`
        },
      },
      dataset,
      series: nextSeries,
      dataZoom: [
        {
          ...(echartsOptions.dataZoom as any[])[0],
          startValue: minX,
          endValue: maxX,
        },
        {
          ...(echartsOptions.dataZoom as any[])[1],
          startValue: minY,
          endValue: maxY,
        },
      ],
    }
  }, [mappedScatterData, keys])

  useEffect(() => {
    if (scatterRef.current) {
      const instance = scatterRef.current.getEchartsInstance()
      if (instance) {
        instance.setOption(
          {
            grid: options.grid,
            series: [{ symbolSize: 40 }],
            dataZoom: options.dataZoom,
          },
          { replaceMerge: ['series', 'dataZoom'] },
        )
        // console.log("ch1", instance.getOption());
      }
    }
  }, [scatterRef.current, keys, options])

  // console.log("ch2", options.series[0].data, options.series[1].data);

  return (
    <div>
      <ChartProvider data={scatterData} echartsOptions={options}>
        <ReactECharts option={options} style={options.style} notMerge={true} theme="dark" />
        <Scatter
          ref={scatterRef}
          context={ChartContext}
          valueList={valueList}
          dimension={dimension}
        />
      </ChartProvider>
    </div>
  )
})
