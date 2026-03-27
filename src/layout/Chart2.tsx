import { memo, useRef, useEffect, useMemo } from 'react'
import { ChartProvider, ChartContext } from '@echarts-readymade/core'
import { Scatter } from '@echarts-readymade/scatter'
import { labels } from '../data'
import ReactECharts from 'echarts-for-react'
import { BioMarker } from '../types/biomarker'

interface ChartProps {
  data: BioMarker[]
  keys: string[]
}

const echartsOptions: any = {
  style: { height: 400, maxWidth: 800 },
  theme: 'dark',
  backgroundColor: 'transparent',
  color: [
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
  ],
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
        const [x, y, date, unitX, unitY] = params.value;
        const dispX = unitX ? `${x} ${unitX}` : x;
        const dispY = unitY ? `${y} ${unitY}` : y;
        return `${date}<br/><strong>${params.dimensionNames[0]}:</strong> ${dispX}<br/><strong>${params.dimensionNames[1]}:</strong> ${dispY}`;
      }
      return params.name || params.seriesName || '';
    }
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

export default memo(({ data, keys }: ChartProps) => {
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
    // Optimization: use a local O(1) map for data lookups instead of O(N) array.find inside a map.
    // This reduces lookup complexity from O(N*K) to O(N + K).
    const dataMap = new Map()
    for (let i = 0; i < data.length; i++) {
      dataMap.set(data[i][0], data[i])
    }

    const matchedData = keys
      .map((key) => {
        return dataMap.get(key)
      })
      .reduce((result: any[][], entry) => {
        if (entry) {
          const [, values] = entry
          values.forEach((v: number | null, i: number) => {
            if (!result[i]) {
              result[i] = [labels[i]]
            }
            result[i].push(v)
          })
        }
        return result
      }, [])
      .filter((v) => v[1] !== null && v[1] !== undefined && v[2] !== null && v[2] !== undefined)

    const unitX = dataMap.get(keys[0])?.[2] || ''
    const unitY = dataMap.get(keys[1])?.[2] || ''

    const mappedScatterData: any[][] = matchedData.map((v) => [v[1], v[2], formatTime(v[0]), unitX, unitY])

    const scatterData: Record<string, any>[] = matchedData.map((v) => ({
      [keys[0]]: v[1],
      [keys[1]]: v[2],
      date: formatTime(v[0]),
    }))

    return [scatterData, mappedScatterData]
  }, [keys, data])

  const scatterRef = useRef<any>(null)

  const options: any = useMemo(() => {
    let { series, yAxis, xAxis } = echartsOptions
    ;(xAxis as any[])[0].name = keys[0]
    ;(yAxis as any[])[0].name = keys[1]

    const dataset: any[] = [
      {
        dimensions: [keys[0], keys[1], 'Date'],
        source: mappedScatterData,
      },
    ]

    // Guard against regression transform crash on <2 points
    if (mappedScatterData.length >= 2) {
      dataset.push({
        transform: {
          type: 'ecStat:regression',
        },
      })
    }

    const nextSeries = [
      series[0],
      // Only include the regression series if dataset contains it
      ...(mappedScatterData.length >= 2 ? [{
        ...series[1],
        datasetIndex: 1,
        tooltip: {
          formatter: (_params: any) => {
            return `<strong>Regression Trend</strong>`
          }
        }
      }] : [])
    ]

    return {
      ...echartsOptions,
      tooltip: {
        ...echartsOptions.tooltip,
        formatter: (params: any) => {
          if (params.seriesType === 'scatter') {
            const val1 = params.value[0]
            const val2 = params.value[1]
            const dateStr = params.value[2]
            const u0 = params.value[3] ? ` ${params.value[3]}` : ''
            const u1 = params.value[4] ? ` ${params.value[4]}` : ''
            return `<strong>${dateStr}</strong><br/>` +
                   `${params.marker} ${keys[0]}: <strong>${val1}${u0}</strong><br/>` +
                   `${params.marker} ${keys[1]}: <strong>${val2}${u1}</strong>`
          }
          return `<strong>Regression Trend</strong>`
        }
      },
      dataset,
      series: nextSeries,
      dataZoom: [
        {
          ...(echartsOptions.dataZoom as any[])[0],
          startValue: mappedScatterData.length > 0 ? Math.min(...mappedScatterData.map((item) => item[0])) : 0,
          endValue: mappedScatterData.length > 0 ? Math.max(...mappedScatterData.map((item) => item[0])) : 100,
        },
        {
          ...(echartsOptions.dataZoom as any[])[1],
          startValue: mappedScatterData.length > 0 ? Math.min(...mappedScatterData.map((item) => item[1])) : 0,
          endValue: mappedScatterData.length > 0 ? Math.max(...mappedScatterData.map((item) => item[1])) : 100,
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
          { notMerge: true },
        )
        // console.log("ch1", instance.getOption());
      }
    }
  }, [scatterRef.current, keys, options])

  // console.log("ch2", options.series[0].data, options.series[1].data);

  return (
    <div>
      <ChartProvider data={scatterData} echartsOptions={options}>
        <ReactECharts option={options} style={options.style} />
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
