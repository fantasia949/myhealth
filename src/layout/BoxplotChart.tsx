import React, { memo } from 'react'
import ReactECharts from 'echarts-for-react'
import { labels } from '../data'

interface BoxplotChartProps {
  name: string
  values: number[]
}

const echartsOptions = {
  style: { height: 300, width: '100%' },
  theme: 'dark',
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '10%',
    right: '10%',
    bottom: '15%'
  },
  xAxis: {
    type: 'category',
    boundaryGap: true,
    nameGap: 30,
    splitArea: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    name: 'Value',
    splitArea: {
      show: true
    }
  }
}

// Custom implementation of prepareBoxplotData to avoid ecStat version issues
function prepareBoxplotData(data: number[][]) {
  const boxData = []
  const outliers = []

  for (let i = 0; i < data.length; i++) {
    const series = data[i].slice().sort((a, b) => a - b)
    if (series.length === 0) continue

    const min = series[0]
    const max = series[series.length - 1]

    // Simple percentile calculator
    const getPercentile = (p: number) => {
      const index = (series.length - 1) * p
      const lower = Math.floor(index)
      const upper = Math.ceil(index)
      const weight = index - lower
      if (upper >= series.length) return series[lower]
      return series[lower] * (1 - weight) + series[upper] * weight
    }

    const q1 = getPercentile(0.25)
    const median = getPercentile(0.5)
    const q3 = getPercentile(0.75)
    const iqr = q3 - q1

    const lowerInnerFence = q1 - 1.5 * iqr
    const upperInnerFence = q3 + 1.5 * iqr

    const seriesOutliers = []
    let actualMin = Number.MAX_VALUE
    let actualMax = -Number.MAX_VALUE

    for (let j = 0; j < series.length; j++) {
      const val = series[j]
      if (val < lowerInnerFence || val > upperInnerFence) {
        seriesOutliers.push([i, val])
      } else {
        if (val < actualMin) actualMin = val
        if (val > actualMax) actualMax = val
      }
    }

    // In boxplot: [min, Q1, median, Q3, max]
    // using actual min/max inside fences to draw whiskers
    boxData.push([
      actualMin === Number.MAX_VALUE ? min : actualMin,
      q1,
      median,
      q3,
      actualMax === -Number.MAX_VALUE ? max : actualMax
    ])

    for (const out of seriesOutliers) {
      outliers.push(out)
    }
  }

  return { boxData, outliers }
}

export default memo(({ name, values }: BoxplotChartProps) => {
  // Group values by 6-month period (H1/H2)
  const groupedData: Record<string, number[]> = {}

  values.forEach((item, index) => {
    if (item === null || item === undefined) return

    const label = labels[index]
    if (!label || label.length < 6) return

    // Label is YYMMDD
    const yy = label.slice(0, 2)
    const mm = parseInt(label.slice(2, 4), 10)

    const year = `20${yy}`
    const half = mm <= 6 ? 'H1' : 'H2'
    const period = `${half} ${year}`

    if (!groupedData[period]) {
      groupedData[period] = []
    }
    groupedData[period].push(item)
  })

  // Ensure chronological ordering by sorting keys
  const periods = Object.keys(groupedData).sort((a, b) => {
    // a and b are like 'H1 2023', 'H2 2023'
    const [halfA, yearA] = a.split(' ')
    const [halfB, yearB] = b.split(' ')
    if (yearA !== yearB) return yearA.localeCompare(yearB)
    return halfA.localeCompare(halfB)
  })

  const datasets = periods.map(p => groupedData[p])

  if (datasets.length === 0) return null

  // prepareBoxplotData expects an array of datasets
  const data = prepareBoxplotData(datasets)

  const options = {
    ...echartsOptions,
    xAxis: {
      ...echartsOptions.xAxis,
      data: periods
    },
    title: {
      text: `${name} Distribution`,
      left: 'center',
      textStyle: {
        color: '#ccc',
      },
    },
    series: [
      {
        name: 'boxplot',
        type: 'boxplot',
        datasetIndex: 0,
        data: data.boxData,
        itemStyle: {
          color: '#5470C688',
          borderColor: '#5470C6'
        },
        tooltip: {
          formatter: function (param: any) {
            return [
              '<strong>' + name + ' Distribution</strong><br/>',
              'Max: ' + param.data[5].toFixed(2),
              'Q3: ' + param.data[4].toFixed(2),
              'Median: ' + param.data[3].toFixed(2),
              'Q1: ' + param.data[2].toFixed(2),
              'Min: ' + param.data[1].toFixed(2)
            ].join('<br/>');
          }
        }
      },
      {
        name: 'outlier',
        type: 'scatter',
        datasetIndex: 1,
        data: data.outliers,
        itemStyle: {
          color: '#CF6D6C'
        },
        tooltip: {
          formatter: function (param: any) {
            return `<strong>Outlier</strong><br/>Value: ${param.data[1]}`
          }
        }
      }
    ],
  }

  return (
    <ReactECharts
      option={options}
      style={echartsOptions.style}
      theme="dark"
      opts={{ renderer: 'canvas' }}
    />
  )
})
