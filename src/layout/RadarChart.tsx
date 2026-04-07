import { memo, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { BioMarker } from '../types/biomarker'

interface RadarChartProps {
  data: BioMarker[]
  tag: string
}

export default memo(({ data, tag }: RadarChartProps) => {
  const options = useMemo(() => {
    const indicators: any[] = []
    const values: number[] = []

    // Optimization: Replace Array.forEach with a traditional for-loop to eliminate closure
    // creation and minimize garbage collection overhead during React renders.
    for (let k = 0; k < data.length; k++) {
      const entry = data[k]
      const name = entry[0]
      const biomarkerValues = entry[1]
      const unit = entry[2]
      const extra = entry[3]

      // Find the latest non-null value
      let latestValue: number | null = null
      let latestIndex = -1
      for (let i = biomarkerValues.length - 1; i >= 0; i--) {
        if (biomarkerValues[i] !== null && biomarkerValues[i] !== undefined) {
          latestValue = biomarkerValues[i]
          latestIndex = i
          break
        }
      }

      if (latestValue !== null && extra && typeof extra.range === 'string') {
        const rangeStr = extra.range
        let min = 0
        let max = latestValue * 2 // Fallback max

        if (rangeStr.includes(' - ')) {
          const parts = rangeStr.split(' - ')
          min = parseFloat(parts[0])
          max = parseFloat(parts[1])
        } else if (rangeStr.startsWith('>=')) {
          min = parseFloat(rangeStr.slice(2))
          max = Math.max(min * 2, latestValue * 1.5) // Arbitrary max for open-ended range
        } else if (rangeStr.startsWith('<=')) {
          max = parseFloat(rangeStr.slice(2))
        }

        // Add 20% padding to max so values exactly at max aren't glued to the edge
        const paddedMax = max + (max - min) * 0.2
        const paddedMin = Math.max(0, min - (max - min) * 0.2) // Prevent negative minimums if appropriate, but keeping it simple

        indicators.push({
          name: name,
          max: paddedMax,
          min: paddedMin,
          // Store original range data for tooltip
          _actualValue: latestValue,
          _unit: unit,
          _range: rangeStr,
          _isNotOptimal:
            extra.optimality && extra.optimality.length > latestIndex
              ? extra.optimality[latestIndex]
              : false,
        })
        values.push(latestValue)
      }
    }

    if (indicators.length === 0) {
      return {} // Handle empty state gracefully if needed
    }

    return {
      style: { height: 400, width: '100%', maxWidth: 600, margin: '0 auto' },
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: '#111111',
        borderColor: '#3a3a3a80',
        textStyle: {
          color: '#f0f0f0',
        },
        formatter: (params: any) => {
          // params.value is an array of the values
          // We need to construct a custom tooltip showing value and range
          let html = `<strong>${tag} Analysis</strong><br/>`
          // Optimization: Replace Array.forEach with a traditional for-loop to eliminate
          // closure creation during tooltip rendering in ECharts.
          for (let idx = 0; idx < indicators.length; idx++) {
            const indicator = indicators[idx]
            const val = params.value[idx]
            const color = indicator._isNotOptimal ? '#c23531' : '#BFDAA7'
            html += `<span style="color:${color}">${indicator.name}</span>: ${val} ${indicator._unit} <span style="color:#888;font-size:12px;">(Range: ${indicator._range})</span><br/>`
          }
          return html
        },
      },
      radar: {
        indicator: indicators,
        splitArea: {
          areaStyle: {
            color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)'],
          },
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
          },
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
      series: [
        {
          name: `${tag} Latest Values`,
          type: 'radar',
          data: [
            {
              value: values,
              name: 'Latest Test',
              areaStyle: {
                color: 'rgba(84, 112, 198, 0.4)',
              },
              lineStyle: {
                color: '#5470C6',
                width: 2,
              },
              itemStyle: {
                color: '#5470C6',
              },
            },
          ],
        },
      ],
    }
  }, [data, tag])

  if (!options.radar) {
    return null
  }

  return (
    <div className="w-full flex justify-center my-4">
      <ReactECharts option={options} style={options.style as any} notMerge={true} theme="dark" />
    </div>
  )
})
