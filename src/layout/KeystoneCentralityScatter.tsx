import React, { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'
import { EChartsReactProps } from 'echarts-for-react'
import { useAtomValue } from 'jotai'
import { nonInferredDataAtom, rankedDataMapAtom } from '../atom/dataAtom'
import { correlationMethodAtom } from '../atom/correlationAtom'
import { calculatePearson, calculateSpearmanRanked } from '../processors/stats'
import { CORRELATION_EXCLUDED_BIOMARKERS } from '../config/correlations'
import { CHART_PALETTE } from './Chart2'

interface KeystoneCentralityScatterProps {
  target: string
}

export default React.memo(function KeystoneCentralityScatter({ target }: KeystoneCentralityScatterProps) {
  const [showOptimal, setShowOptimal] = useState(false)
  const data = useAtomValue(nonInferredDataAtom)
  const rankedDataMap = useAtomValue(rankedDataMapAtom)
  const method = useAtomValue(correlationMethodAtom)

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []

    const validData = data.filter((d) => !CORRELATION_EXCLUDED_BIOMARKERS.includes(d[0]))
    const n = validData.length

    if (n < 2) return []

    // 1. Calculate OOR Frequency for each valid biomarker
    // 2. Calculate average absolute correlation for each valid biomarker

    const results: { name: string; centrality: number; oorFrequency: number; isTarget: boolean }[] = []

    const maxLen = data.length > 0 ? data[0][1].length : 0
    const xPearson = new Float64Array(maxLen)
    const yPearson = new Float64Array(maxLen)

    for (let i = 0; i < n; i++) {
      const sourceItem = validData[i]
      const sourceName = sourceItem[0]
      const sourceValues = sourceItem[1]
      const extra = sourceItem[3]

      // Compute OOR Frequency
      let oorCount = 0
      const optimality = extra.optimality
      let totalValidOOR = 0

      if (optimality && optimality.length > 0) {
        // Find how many valid data points there are (not null/undefined)
        for (let k = 0; k < sourceValues.length; k++) {
            if (sourceValues[k] !== null && sourceValues[k] !== undefined && (sourceValues[k] as any) !== '') {
               totalValidOOR++
               if (optimality[k]) {
                   oorCount++
               }
            }
        }
      }

      if (totalValidOOR < 4) continue

      const oorFrequency = (oorCount / totalValidOOR) * 100
      if (!showOptimal && oorFrequency === 0) continue

      // Compute Centrality
      let sumAbsCorr = 0
      let validCorrelations = 0

      const sourceRanks = rankedDataMap.get(sourceName)

      // Pre-parse the source values and record valid indices for Pearson
      const validSourceIndices: number[] = []
      if (method === 'pearson') {
          for (let k = 0; k < sourceValues.length; k++) {
            const v = sourceValues[k]
            if (v !== null && v !== undefined && (v as any) !== '') {
              validSourceIndices.push(k)
            }
          }
      }

      for (let j = 0; j < n; j++) {
        if (i === j) continue // Exclude self

        const targetItem = validData[j]
        const targetName = targetItem[0]

        let absCorr = 0

        if (method === 'pearson') {
          const targetValues = targetItem[1]
          let count = 0

          for (let k = 0; k < validSourceIndices.length; k++) {
            const idx = validSourceIndices[k]
            const tv = targetValues[idx]
            if (tv !== null && tv !== undefined && (tv as any) !== '') {
              xPearson[count] = +sourceValues[idx]!
              yPearson[count] = +tv
              count++
            }
          }

          if (count >= 4) {
            const result = calculatePearson(xPearson.subarray(0, count), yPearson.subarray(0, count), { alpha: 0.05, alternative: 'two-sided' })
            absCorr = Math.abs(result.statistic)
            if (!isNaN(absCorr)) {
                sumAbsCorr += absCorr
                validCorrelations++
            }
          }
        } else {
          // Spearman
          const targetRanks = rankedDataMap.get(targetName)
          if (sourceRanks && targetRanks) {
            const result = calculateSpearmanRanked(sourceRanks, targetRanks, { alpha: 0.05, alternative: 'two-sided' })
            absCorr = Math.abs(result.statistic)
             if (!isNaN(absCorr)) {
                sumAbsCorr += absCorr
                validCorrelations++
            }
          }
        }
      }

      const centrality = validCorrelations > 0 ? sumAbsCorr / validCorrelations : 0

      results.push({
        name: sourceName,
        centrality,
        oorFrequency,
        isTarget: sourceName === target
      })
    }

    return results
  }, [data, rankedDataMap, method, target, showOptimal])

  const option = useMemo<EChartsOption & Pick<EChartsReactProps, 'style' | 'theme'>>(() => {
    if (chartData.length === 0) return {}

    return {
      backgroundColor: 'transparent',
      theme: 'dark',
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data
          return `
            <div style="font-weight:bold;margin-bottom:4px;">${data.name}</div>
            Centrality: ${data.value[0].toFixed(3)}<br/>
            Out-of-Range: ${data.value[1].toFixed(1)}%
          `
        },
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        textStyle: { color: '#f3f4f6' },
      },
      grid: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 50,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'Centrality (Avg |r|)',
        nameLocation: 'middle',
        nameGap: 30,
        splitLine: {
          lineStyle: { color: '#333', type: 'dashed' },
        },
        axisLabel: { color: '#9ca3af' },
        nameTextStyle: { color: '#9ca3af' },
      },
      yAxis: {
        type: 'value',
        name: 'Out-of-Range Freq (%)',
        nameLocation: 'middle',
        nameGap: 35,
        splitLine: {
          lineStyle: { color: '#333', type: 'dashed' },
        },
        axisLabel: { color: '#9ca3af' },
        nameTextStyle: { color: '#9ca3af' },
      },
      series: [
        {
          type: 'scatter',
          data: chartData.map((item) => ({
            name: item.name,
            value: [item.centrality, item.oorFrequency],
            itemStyle: {
              color: item.isTarget ? '#3b82f6' : CHART_PALETTE[1],
              opacity: item.isTarget ? 1 : 0.6,
              borderColor: item.isTarget ? '#60a5fa' : 'transparent',
              borderWidth: item.isTarget ? 2 : 0,
            },
            symbolSize: item.isTarget ? 14 : 10,
          })),
        },
      ],
    }
  }, [chartData])

  if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[400px] text-gray-500 text-sm">
            Not enough data to compute centrality.
        </div>
      )
  }

  return (
    <div className="flex flex-col relative">
        <div className="absolute top-0 right-4 z-10 flex items-center gap-2">
           <input
               type="checkbox"
               id="showOptimal"
               checked={showOptimal}
               onChange={(e) => setShowOptimal(e.target.checked)}
               className="rounded border-gray-600 bg-dark-bg text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 cursor-pointer"
           />
           <label htmlFor="showOptimal" className="text-xs text-gray-400 cursor-pointer select-none">
               Show 100% Optimal Biomarkers
           </label>
        </div>
        <ReactECharts
      option={option}
      style={{ height: '400px', width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
    </div>
  )
})
