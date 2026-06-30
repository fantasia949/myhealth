import React, { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import ReactECharts from 'echarts-for-react'
import { dataMapAtom } from '../atom/dataAtom'
import { DirectionalCorrelationScatterProps } from './DirectionalCorrelationScatter.types'
import { CHART_PALETTE } from './Chart2'

export default React.memo(
  ({ target, correlations, alternative }: DirectionalCorrelationScatterProps) => {
    const dataMap = useAtomValue(dataMapAtom)

    // Sort correlations by absolute coefficient to find the strongest ones
    const sortedCorrelations = useMemo(() => {
      return [...correlations].sort((a, b) => Math.abs(b[2]) - Math.abs(a[2]))
    }, [correlations])

    // Select the top correlated biomarker by default
    const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(
      sortedCorrelations.length > 0 ? sortedCorrelations[0][0] : null
    )

    // Make sure selectedBiomarker is valid
    const actualSelectedBiomarker = React.useMemo(() => {
      if (sortedCorrelations.length === 0) return null
      if (selectedBiomarker && sortedCorrelations.some(c => c[0] === selectedBiomarker)) {
        return selectedBiomarker
      }
      return sortedCorrelations[0][0]
    }, [sortedCorrelations, selectedBiomarker])

    const chartOption = useMemo(() => {
      if (!actualSelectedBiomarker || !target) return {}

      const targetData = dataMap.get(target)
      const selectedData = dataMap.get(actualSelectedBiomarker)

      if (!targetData || !selectedData) return {}

      const targetValues = targetData[1]
      const selectedValues = selectedData[1]

      // Determine valid data points
      const scatterData: [number, number][] = []
      const len = Math.min(targetValues.length, selectedValues.length)
      for (let i = 0; i < len; i++) {
        const x = targetValues[i]
        const y = selectedValues[i]
        if (x != null && !Number.isNaN(x) && y != null && !Number.isNaN(y)) {
          scatterData.push([x, y])
        }
      }

      const currentCorrelation = sortedCorrelations.find((c) => c[0] === actualSelectedBiomarker)
      const coeff = currentCorrelation ? currentCorrelation[2] : 0

      const isPositive = coeff > 0
      const color = isPositive ? CHART_PALETTE[7] : CHART_PALETTE[0]

      return {
        backgroundColor: 'transparent',
        textStyle: {
          fontFamily: 'Inter, sans-serif',
        },
        grid: {
          top: 40,
          right: 30,
          bottom: 40,
          left: 50,
          containLabel: true,
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(17, 17, 17, 0.9)',
          borderColor: '#333',
          textStyle: { color: '#f0f0f0' },
          formatter: (params: any) => {
            const data = params.data as [number, number]
            return `
              <div style="font-weight:bold;margin-bottom:4px;">Observation</div>
              ${target}: ${data[0].toFixed(2)}<br/>
              ${actualSelectedBiomarker}: ${data[1].toFixed(2)}
            `
          }
        },
        xAxis: {
          type: 'value',
          name: target,
          nameLocation: 'middle',
          nameGap: 30,
          scale: true,
          splitLine: {
            lineStyle: { color: '#333', type: 'dashed' },
          },
          axisLabel: { color: '#999' },
          nameTextStyle: { color: '#ccc', fontWeight: 'bold' }
        },
        yAxis: {
          type: 'value',
          name: actualSelectedBiomarker,
          nameLocation: 'middle',
          nameGap: 40,
          scale: true,
          splitLine: {
            lineStyle: { color: '#333', type: 'dashed' },
          },
          axisLabel: { color: '#999' },
          nameTextStyle: { color: '#ccc', fontWeight: 'bold' }
        },
        series: [
          {
            type: 'scatter',
            data: scatterData,
            itemStyle: {
              color: color,
              opacity: 0.7,
            },
            symbolSize: 8,
            markLine: {
              silent: true,
              lineStyle: {
                type: 'solid',
                color: '#555',
              },
              data: [
                { type: 'average', valueIndex: 0, name: 'Target Avg' },
                { type: 'average', valueIndex: 1, name: 'Selected Avg' }
              ],
              label: {
                formatter: '{b}'
              }
            }
          }
        ]
      }
    }, [actualSelectedBiomarker, target, dataMap, sortedCorrelations])

    if (!correlations || correlations.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-700 bg-dark-bg p-4 text-gray-400">
          No significant directional correlations found for the selected criteria.
        </div>
      )
    }

    return (
      <div className="flex flex-col space-y-4 rounded-xl border border-gray-700 bg-gray-900/50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-200">
            Directional Profile:{' '}
            <span className="text-gray-400 font-normal">
              Analyzing boundaries for {alternative} hypothesis
            </span>
          </h3>
          <div className="flex items-center space-x-2">
            <label htmlFor="biomarker-select" className="text-xs text-gray-400">
              Correlated Biomarker:
            </label>
            <select
              id="biomarker-select"
              value={actualSelectedBiomarker || ''}
              onChange={(e) => setSelectedBiomarker(e.target.value)}
              className="rounded border border-gray-600 bg-dark-bg px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {sortedCorrelations.map(([name, _p, coeff]) => (
                <option key={name} value={name}>
                  {name} (Coeff: {coeff.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-80 w-full">
          {actualSelectedBiomarker && (
            <ReactECharts
              option={chartOption}
              style={{ height: '100%', width: '100%' }}
              theme="dark"
              opts={{ renderer: 'svg' }}
            />
          )}
        </div>
      </div>
    )
  }
)
