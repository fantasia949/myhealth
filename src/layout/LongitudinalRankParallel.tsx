import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useAtomValue } from 'jotai'
import { nonInferredDataAtom, rankedDataMapAtom } from '../atom/dataAtom'
import { labels, formattedLabels } from '../data'
import { CHART_PALETTE } from './Chart2'

// Longitudinal Rank Inversion Parallel Coordinates Chart component
const LongitudinalRankParallel = React.memo(() => {
  const nonInferredData = useAtomValue(nonInferredDataAtom)
  const rankedDataMap = useAtomValue(rankedDataMapAtom)

  // 1. Calculate Coefficient of Variation (CV) for each measured biomarker
  const volatileBiomarkers = useMemo(() => {
    if (!nonInferredData || nonInferredData.length === 0) return []

    const candidates: { name: string; cv: number; values: (number | null)[] }[] = []

    for (let i = 0; i < nonInferredData.length; i++) {
      const entry = nonInferredData[i]
      const name = entry[0]
      const rawValues = entry[1]

      // Filter to get valid numbers
      const validValues: number[] = []
      const processedValues: (number | null)[] = []
      for (let j = 0; j < rawValues.length; j++) {
        const val = rawValues[j]
        if (val !== null && val !== undefined) {
          const num = Number(val)
          if (!isNaN(num)) {
            validValues.push(num)
            processedValues.push(num)
            continue
          }
        }
        processedValues.push(null)
      }

      if (validValues.length < 3) continue

      // Calculate Mean
      let sum = 0
      for (let j = 0; j < validValues.length; j++) {
        sum += validValues[j]
      }
      const mean = sum / validValues.length

      if (mean === 0) continue

      // Calculate Standard Deviation (SD)
      let sumSqDiff = 0
      for (let j = 0; j < validValues.length; j++) {
        const diff = validValues[j] - mean
        sumSqDiff += diff * diff
      }
      const sd = Math.sqrt(sumSqDiff / validValues.length)

      // Coefficient of Variation (CV)
      const cv = sd / mean

      // Only include if there is some variation
      if (cv > 0) {
        candidates.push({ name, cv, values: processedValues })
      }
    }

    // Sort by CV descending to get top 10 most volatile
    candidates.sort((a, b) => b.cv - a.cv)
    return candidates.slice(0, 10)
  }, [nonInferredData])

  // 2. Build the Parallel Coordinates options
  const option = useMemo(() => {
    if (volatileBiomarkers.length === 0) return {}

    // Axis represents dates (oldest to newest)
    const parallelAxis = labels.map((label, idx) => {
      const displayDate = formattedLabels[idx] || label
      return {
        dim: idx,
        name: displayDate,
        type: 'value' as const,
        min: 0,
        max: 100,
        inverse: true, // We want 1st percentile (0 or top ranks) at the top!
        nameLocation: 'end' as const,
        axisLabel: {
          formatter: '{value}%',
        },
      }
    })

    // Series represents line data for each biomarker
    const seriesData = volatileBiomarkers.map((bm) => {
      const ranks = rankedDataMap.get(bm.name)
      const name = bm.name

      // Create an array aligned with each date
      const dataLine = labels.map((_, dateIdx) => {
        const rawVal = bm.values[dateIdx]
        if (rawVal === null || !ranks) {
          return '-' // ECharts missing value sentinel to leave gap
        }

        // Convert Spearman rank back to percentile relative to its own history
        // ranks is a Float64Array aligned with the same rawValues length (and dates)
        const rankVal = ranks[dateIdx]
        const validRanks: number[] = []
        for (let rIdx = 0; rIdx < ranks.length; rIdx++) {
          const r = ranks[rIdx]
          if (!isNaN(r)) {
            validRanks.push(r)
          }
        }
        if (validRanks.length <= 1) return 0

        let minRank = validRanks[0]
        let maxRank = validRanks[0]
        for (let rIdx = 1; rIdx < validRanks.length; rIdx++) {
          if (validRanks[rIdx] < minRank) minRank = validRanks[rIdx]
          if (validRanks[rIdx] > maxRank) maxRank = validRanks[rIdx]
        }

        // Prevent division by zero
        if (maxRank === minRank) return 100

        // Percentile from 0 to 100
        const pct = ((rankVal - minRank) / (maxRank - minRank)) * 100
        return Math.round(pct)
      })

      return {
        name,
        value: dataLine,
      }
    })

    return {
      theme: 'dark',
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#111111',
        borderColor: '#3a3a3a80',
        textStyle: { color: '#f0f0f0' },
        formatter: (params: any) => {
          const bmName = params.name
          const valArray = params.value
          let tooltipHtml = `<strong style="color: #2563eb">${bmName}</strong><br/>`

          for (let idx = 0; idx < labels.length; idx++) {
            const label = labels[idx]
            const dateStr = formattedLabels[idx] || label
            const val = valArray[idx]
            let rawVal = null
            for (let bIdx = 0; bIdx < volatileBiomarkers.length; bIdx++) {
              if (volatileBiomarkers[bIdx].name === bmName) {
                rawVal = volatileBiomarkers[bIdx].values[idx]
                break
              }
            }
            const rawValStr = rawVal !== null && rawVal !== undefined ? rawVal.toFixed(2) : 'N/A'

            if (val === '-') {
              tooltipHtml += `${dateStr}: <span style="color:#888">No Measurement</span><br/>`
            } else {
              tooltipHtml += `${dateStr}: <strong>${val}%</strong> (Value: ${rawValStr})<br/>`
            }
          }
          return tooltipHtml
        },
      },
      legend: {
        top: 'bottom',
        data: volatileBiomarkers.map((b) => b.name),
        textStyle: {
          color: '#ccc',
          fontSize: 11,
        },
        type: 'scroll',
      },
      parallelAxis,
      parallel: {
        left: '8%',
        right: '10%',
        bottom: '15%',
        top: '12%',
        parallelAxisDefault: {
          type: 'value',
          nameTextStyle: {
            color: '#aaa',
            fontSize: 10,
          },
          axisLine: {
            lineStyle: {
              color: '#555',
            },
          },
          axisTick: {
            lineStyle: {
              color: '#555',
            },
          },
          splitLine: {
            show: false,
          },
        },
      },
      color: CHART_PALETTE,
      series: seriesData.map((s) => ({
        name: s.name,
        type: 'parallel',
        lineStyle: {
          width: 2.5,
          opacity: 0.7,
        },
        emphasis: {
          lineStyle: {
            width: 4.5,
            opacity: 1,
          },
        },
        data: [s.value],
      })),
    }
  }, [volatileBiomarkers, rankedDataMap])

  if (volatileBiomarkers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400">
        <span>No measured biomarkers found with sufficient historical records.</span>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] border border-gray-700 rounded bg-dark-bg/50 mt-4 overflow-hidden relative flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 bg-[#222222] border-b border-gray-700">
        <div>
          <h3 className="text-sm font-medium text-gray-200">Longitudinal Rank Inversion</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Spearman Rank Percentile over time for the top 10 most volatile biomarkers (by Coefficient of Variation)
          </p>
        </div>
      </div>
      <div className="flex-grow min-h-0">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          theme="dark"
        />
      </div>
    </div>
  )
})

export default LongitudinalRankParallel
