import React, { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { useAtomValue } from 'jotai'
import { visibleDataAtom, dataMapAtom, rankedDataMapAtom } from '../atom/dataAtom'
import {
  correlationAlphaAtom,
  correlationAlternativeAtom,
  correlationMethodAtom,
} from '../atom/correlationAtom'
import { calculateSpearmanRanked, calculatePearson } from '../processors/stats'
import type { HeatmapSeriesOption } from 'echarts'

const CorrelationHeatmap = React.memo(() => {
  const visibleData = useAtomValue(visibleDataAtom)
  const dataMap = useAtomValue(dataMapAtom)
  const rankedDataMap = useAtomValue(rankedDataMapAtom)
  const alpha = useAtomValue(correlationAlphaAtom)
  const alternative = useAtomValue(correlationAlternativeAtom)
  const method = useAtomValue(correlationMethodAtom)

  // Toggle for visualization mode
  const [colorMode, setColorMode] = useState<'rho' | 'pvalue'>('rho')

  const options = useMemo(() => {
    if (!visibleData || visibleData.length === 0) return {}

    const numData = visibleData.length
    const names: string[] = []
    for (let i = 0; i < numData; i++) {
      names.push(visibleData[i][0])
    }

    const optionsStats = { alpha, alternative }

    // Data format: [xIndex, yIndex, rho, pValue]
    // Data format: [xIndex, yIndex, displayRhoOrPValue, pValue, actualRho]
    const dataPoints: [number, number, number, number, number][] = []

    if (method === 'pearson') {
      let maxDatasetLen = 0
      for (let i = 0; i < numData; i++) {
        const len = dataMap.get(names[i])?.[1].length || 0
        if (len > maxDatasetLen) maxDatasetLen = len
      }

      const parsedSource = new Float64Array(maxDatasetLen)
      const validIndicesArray = new Int32Array(maxDatasetLen)
      const x = new Float64Array(maxDatasetLen)
      const y = new Float64Array(maxDatasetLen)

      for (let i = 0; i < numData; i++) {
        const sourceName = names[i]
        const sourceValuesRaw = dataMap.get(sourceName)?.[1]
        if (!sourceValuesRaw) continue

        const len = sourceValuesRaw.length
        let validCount = 0

        for (let k = 0; k < len; k++) {
          const v = sourceValuesRaw[k]
          if (v !== null) {
            const vNum = Number(v)
            if (!isNaN(vNum)) {
              parsedSource[k] = vNum
              validIndicesArray[validCount++] = k
            }
          }
        }

        const maxLen = validCount
        if (maxLen < 4) continue

        // Self correlation
        dataPoints.push([i, i, colorMode === 'rho' ? 1 : 0, 0, 1])

        for (let j = i + 1; j < numData; j++) {
          const targetName = names[j]
          const targetValuesRaw = dataMap.get(targetName)?.[1]
          if (!targetValuesRaw) continue

          let count = 0
          for (let k = 0; k < validCount; k++) {
            const idx = validIndicesArray[k]
            const t = targetValuesRaw[idx]
            if (t !== null) {
              const tNum = Number(t)
              if (!isNaN(tNum)) {
                x[count] = parsedSource[idx]
                y[count] = tNum
                count++
              }
            }
          }

          if (count < 4) continue

          const result = calculatePearson(x.subarray(0, count), y.subarray(0, count), optionsStats)

          const isSig = result.pValue <= alpha
          let displayVal = 0
          if (colorMode === 'rho') {
            displayVal = isSig ? result.pcorr : 0
          } else {
            displayVal = result.pValue
          }
          dataPoints.push([i, j, displayVal, result.pValue, result.pcorr])
          dataPoints.push([j, i, displayVal, result.pValue, result.pcorr]) // symmetric
        }
      }
    } else {
      // Spearman
      for (let i = 0; i < numData; i++) {
        const sourceName = names[i]
        const sourceRanks = rankedDataMap.get(sourceName)
        if (!sourceRanks) continue

        dataPoints.push([i, i, colorMode === 'rho' ? 1 : 0, 0, 1])

        for (let j = i + 1; j < numData; j++) {
          const targetName = names[j]
          const targetRanks = rankedDataMap.get(targetName)
          if (!targetRanks) continue

          const result = calculateSpearmanRanked(sourceRanks, targetRanks, optionsStats)
          const isSig = result.pValue <= alpha
          let displayVal = 0
          if (colorMode === 'rho') {
            displayVal = isSig ? result.pcorr : 0
          } else {
            displayVal = result.pValue
          }
          dataPoints.push([i, j, displayVal, result.pValue, result.pcorr])
          dataPoints.push([j, i, displayVal, result.pValue, result.pcorr])
        }
      }
    }

    const isRho = colorMode === 'rho'

    return {
      theme: 'dark',
      backgroundColor: 'transparent',
      tooltip: {
        position: 'top',
        backgroundColor: '#111111',
        borderColor: '#3a3a3a80',
        textStyle: { color: '#f0f0f0' },
        formatter: (params: any) => {
          const val = params.data
          const rho = val[4].toFixed(3)
          const pvalStr = val[3].toFixed(4)
          let pvalFormatted = pvalStr
          if (val[3] <= 0.001) pvalFormatted = '< 0.001'
          if (val[3] <= 0.01 && val[3] > 0.001) pvalFormatted = '< 0.01'

          const sigIndicator =
            val[3] <= alpha
              ? '<strong style="color:#10b981">Significant</strong>'
              : '<strong style="color:#ef4444">Not Significant</strong>'

          return `${names[val[0]]} ↔ ${names[val[1]]}<br/>Rho: <strong>${rho}</strong><br/>P-Value: <strong>${pvalFormatted}</strong><br/>${sigIndicator}`
        },
      },
      animation: false,
      grid: {
        height: '80%',
        top: '10%',
        right: '15%',
        left: '15%',
      },
      xAxis: {
        type: 'category',
        data: names,
        splitArea: { show: true },
        axisLabel: { interval: 0, rotate: 45, width: 100, overflow: 'truncate' },
      },
      yAxis: {
        type: 'category',
        data: names,
        splitArea: { show: true },
        axisLabel: { width: 120, overflow: 'truncate' },
      },
      visualMap: {
        min: isRho ? -1 : 0,
        max: isRho ? 1 : 1,
        calculable: true,
        orient: 'vertical',
        right: '5%',
        top: 'center',
        inRange: {
          color: isRho
            ? ['#ef4444', '#222222', '#10b981'] // Red to Dark to Green for Correlation
            : ['#10b981', '#222222', '#222222'], // Green (significant) to Dark for P-Value
        },
        formatter: isRho ? undefined : (value: number) => value.toFixed(3),
      },
      series: [
        {
          name: 'Correlation Matrix',
          type: 'heatmap',
          data: dataPoints,
          label: {
            show: false, // Too many cells, keep it clean
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          // In ECharts, dataset is structured to provide value by dimensions.
          // We need to map which array index maps to value
          encode: {
            x: 0,
            y: 1,
            value: isRho ? 2 : 3, // VisualMap dimension
          },
        } as HeatmapSeriesOption,
      ],
    }
  }, [visibleData, dataMap, rankedDataMap, alpha, alternative, method, colorMode])

  if (!visibleData || visibleData.length === 0) return null

  return (
    <div className="w-full h-[800px] border border-gray-700 rounded bg-dark-bg/50 mt-4 overflow-hidden relative flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 bg-[#222222] border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-200">Correlation Significance Matrix</h3>
        <div className="flex space-x-1 rounded bg-gray-800 p-1">
          <button
            type="button"
            aria-pressed={colorMode === 'rho'}
            aria-label="View correlation strength"
            onClick={() => setColorMode('rho')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              colorMode === 'rho' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Strength (Rho)
          </button>
          <button
            type="button"
            aria-pressed={colorMode === 'pvalue'}
            aria-label="View correlation significance"
            onClick={() => setColorMode('pvalue')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              colorMode === 'pvalue' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Significance (P-Value)
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ReactECharts
          option={options}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          theme="dark"
        />
      </div>
    </div>
  )
})

export default CorrelationHeatmap
