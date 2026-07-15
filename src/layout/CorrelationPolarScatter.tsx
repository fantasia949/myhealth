import React, { useMemo } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'
import { CallbackDataParams } from 'echarts/types/dist/shared'
import { CorrelationPolarScatterProps } from './CorrelationPolarScatter.types'
import { CHART_PALETTE } from './Chart2'

export default React.memo(({ target, correlations, alpha }: CorrelationPolarScatterProps) => {
  const chartOption = useMemo<EChartsOption>(() => {
    if (!correlations || correlations.length === 0) return {}

    // Process data into polar coordinates
    const polarData: { name: string; value: [number, number, number, number]; pValue: number; coeff: number }[] = []

    for (let i = 0; i < correlations.length; i++) {
      const [name, pValue, coeff] = correlations[i]
      const radius = Math.abs(coeff)

      // Calculate angle based on significance
      // Positive: 0 to 90
      // Negative: 180 to 270
      // Lower p-value means closer to 0 or 180
      let angle = 0
      const sigRatio = Math.min(pValue / alpha, 1) // Clamp to 1 just in case

      if (coeff >= 0) {
        angle = sigRatio * 90
      } else {
        angle = 180 + (sigRatio * 90)
      }

      // value: [radius, angle, coeff, pValue]
      polarData.push({
        name,
        value: [radius, angle, coeff, pValue],
        pValue,
        coeff
      })
    }

    return {
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'Inter, sans-serif',
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(17, 17, 17, 0.9)',
        borderColor: '#333',
        textStyle: { color: '#f0f0f0' },
        formatter: (p: any) => {
          const params = (Array.isArray(p) ? p[0] : p) as CallbackDataParams
          const data = params.data as { name: string; value: [number, number, number, number] }
          if (!data) return ''

          const name = data.name
          const coeff = data.value[2]
          const pVal = data.value[3]
          const radius = data.value[0]
          const angle = data.value[1]

          return `
            <div style="font-weight:bold;margin-bottom:4px;">${name} (Target: ${target})</div>
            <div>Coefficient: <span style="color:${coeff >= 0 ? CHART_PALETTE[7] : CHART_PALETTE[0]}">${coeff.toFixed(4)}</span></div>
            <div>P-Value: ${pVal.toExponential(4)}</div>
            <div style="margin-top:4px;font-size:11px;color:#999;">
              Radius: ${radius.toFixed(2)} | Angle: ${angle.toFixed(1)}°
            </div>
          `
        }
      },
      polar: {
        center: ['50%', '50%'],
        radius: '75%'
      },
      angleAxis: {
        type: 'value',
        min: 0,
        max: 360,
        startAngle: 90, // ECharts startAngle is mathematically standard, 90 is top. Let's leave as 90.
        splitLine: {
          lineStyle: { color: '#333', type: 'dashed' }
        },
        axisLabel: {
          color: '#999',
          formatter: (value: number) => {
            if (value === 0) return '+0° (Highly Pos)'
            if (value === 90) return '+90° (Weakly Pos)'
            if (value === 180) return '-180° (Highly Neg)'
            if (value === 270) return '-270° (Weakly Neg)'
            return `${value}°`
          }
        }
      },
      radiusAxis: {
        type: 'value',
        min: 0,
        max: 1, // Correlation magnitude max is 1
        splitLine: {
          lineStyle: { color: '#333', type: 'dashed' }
        },
        axisLabel: { color: '#999' }
      },
      series: [
        {
          type: 'scatter',
          coordinateSystem: 'polar',
          data: polarData,
          symbolSize: (val: number[]) => {
            // Make higher correlation slightly larger
            return 8 + (val[0] * 10)
          },
          itemStyle: {
            color: (params: any) => {
              const data = params.data as { value: [number, number, number, number] }
              return data.value[2] >= 0 ? CHART_PALETTE[7] : CHART_PALETTE[0]
            },
            opacity: 0.8
          }
        }
      ]
    }
  }, [target, correlations, alpha])

  if (!correlations || correlations.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-700 bg-dark-bg p-4 text-gray-400">
        No significant correlations found to plot.
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4 rounded-xl border border-gray-700 bg-gray-900/50 p-4">
      <div className="flex items-center space-x-2 relative group">
        <h3 className="text-sm font-medium text-gray-200">
          Correlation Directionality: <span className="text-gray-400 font-normal">Polar View</span>
        </h3>
        <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-200 transition-colors" />
        <div className="absolute left-0 top-6 z-10 w-80 rounded-md bg-gray-800 p-3 text-xs text-gray-300 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-700 pointer-events-none">
          This polar scatter plot groups correlated biomarkers by their directionality and significance.
          <br/><br/>
          <strong>Radius:</strong> The distance from center indicates the magnitude of correlation (larger magnitude = further out).
          <br/><br/>
          <strong>Angle:</strong> The angular position represents directionality (0°-90° for Positive, 180°-270° for Negative) and significance (closer to 0°/180° means lower p-value / higher significance).
        </div>
      </div>

      <div className="h-96 w-full">
        <ReactECharts
          option={chartOption}
          style={{ height: '100%', width: '100%' }}
          theme="dark"
          opts={{ renderer: 'svg' }}
        />
      </div>
    </div>
  )
})
