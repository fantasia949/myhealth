import React, { memo, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useAtomValue } from 'jotai'
import { rankedDataMapAtom } from '../atom/dataAtom'
import { correlationMethodAtom } from '../atom/correlationAtom'
import { CHART_PALETTE } from './Chart2'
import { labels, formattedLabels } from '../data'
import { CorrelationResult } from './BiomarkerCorrelation.types'
import { calculatePearson } from '../processors/stats'

interface BumpChartProps {
  targetBiomarker: string
  correlations: CorrelationResult[]
  noteValues: any[]
}

export default memo(({ targetBiomarker, correlations, noteValues }: BumpChartProps) => {
  const rankedDataMap = useAtomValue(rankedDataMapAtom)
  const _correlationMethod = useAtomValue(correlationMethodAtom)

  const options = useMemo(() => {
    // Only proceed if we have a target biomarker and correlated supplements
    if (!targetBiomarker || !correlations || correlations.length === 0) return {}

    // Take top 5 most highly correlated (by absolute rho)
    const topCorrelations = [...correlations]
      .sort((a, b) => Math.abs(b.rho) - Math.abs(a.rho))
      .slice(0, 5)

    const numWindows = 6 // Divide timeline into 6 distinct chronological windows
    const totalPoints = labels.length
    const pointsPerWindow = Math.floor(totalPoints / numWindows)
    const windowLabels: string[] = []

    // ⚡ Bolt Optimization: Pre-allocate target biomarker rank array
    const targetRanks = rankedDataMap.get(targetBiomarker)
    if (!targetRanks) return {}

    const validIndices = []
    for (let i = 0; i < totalPoints; i++) {
      if (!Number.isNaN(targetRanks[i])) {
        validIndices.push(i)
      }
    }
    const count = validIndices.length

    // Create binary vectors for top supplements over the entire valid length
    const suppVectors = new Map<string, Int8Array>()
    for (let j = 0; j < topCorrelations.length; j++) {
      suppVectors.set(topCorrelations[j].name, new Int8Array(count))
    }

    for (let k = 0; k < count; k++) {
      const i = validIndices[k]
      const note = noteValues[i]
      if (note && note.supps) {
        for (let j = 0; j < note.supps.length; j++) {
          const supp = note.supps[j]
          const vector = suppVectors.get(supp)
          if (vector) {
            vector[k] = 1
          }
        }
      }
    }

    const windowedRanksMap = new Map<string, number[]>()
    topCorrelations.forEach((supp) => windowedRanksMap.set(supp.name, []))

    // Chunk the data into windows and recalculate rho for each window
    for (let w = 0; w < numWindows; w++) {
      const startIdx = w * pointsPerWindow
      const endIdx = w === numWindows - 1 ? totalPoints : (w + 1) * pointsPerWindow

      windowLabels.push(`${formattedLabels[startIdx]}`)

      // Find which valid indices fall into this window
      const windowValidIndices = validIndices.filter((i) => i >= startIdx && i < endIdx)
      const windowCount = windowValidIndices.length

      if (windowCount < 5) {
        // Not enough data points in this window to calculate meaningful correlation, rank everyone last
        topCorrelations.forEach((supp) => {
          windowedRanksMap.get(supp.name)!.push(6) // out of 5
        })
        continue
      }

      const windowBiomarkerRanks = new Float64Array(windowCount)
      const windowSuppVectors = new Map<string, Int8Array>()
      topCorrelations.forEach((supp) =>
        windowSuppVectors.set(supp.name, new Int8Array(windowCount)),
      )

      // Map global valid indices to windowed valid indices
      let windowK = 0
      for (let k = 0; k < count; k++) {
        const globalI = validIndices[k]
        if (globalI >= startIdx && globalI < endIdx) {
          windowBiomarkerRanks[windowK] = targetRanks[k]
          topCorrelations.forEach((supp) => {
            windowSuppVectors.get(supp.name)![windowK] = suppVectors.get(supp.name)![k]
          })
          windowK++
        }
      }

      const windowRhos: { name: string; rho: number }[] = []

      topCorrelations.forEach((supp) => {
        const suppVector = windowSuppVectors.get(supp.name)!

        let hasSuppVariation = false
        const firstVal = suppVector[0]
        for (let i = 1; i < windowCount; i++) {
          if (suppVector[i] !== firstVal) {
            hasSuppVariation = true
            break
          }
        }

        if (!hasSuppVariation) {
          windowRhos.push({ name: supp.name, rho: 0 })
        } else {
          const result = calculatePearson(windowBiomarkerRanks, suppVector, {
            alpha: 0.05,
            alternative: 'two-sided',
          })
          windowRhos.push({ name: supp.name, rho: Math.abs(result.pcorr || 0) })
        }
      })

      // Sort by absolute rho descending to determine rank
      windowRhos.sort((a, b) => b.rho - a.rho)

      // Assign ranks (1 to 5)
      windowRhos.forEach((wr, rankIdx) => {
        const currentRanks = windowedRanksMap.get(wr.name)!
        currentRanks.push(rankIdx + 1)
      })
    }

    const series = topCorrelations.map((supp) => {
      return {
        name: supp.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 4,
        },
        data: windowedRanksMap.get(supp.name),
      }
    })

    return {
      style: { height: 350, width: '100%' },
      theme: 'dark',
      backgroundColor: 'transparent',
      color: CHART_PALETTE,
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#111111',
        borderColor: '#3a3a3a80',
        textStyle: { color: '#f0f0f0' },
        formatter: (params: any) => {
          let tooltipStr = `<strong>${params[0].axisValue}</strong>`
          const pArray = Array.isArray(params) ? params : [params]
          // Sort tooltip by rank value
          pArray.sort((a: any, b: any) => a.value - b.value)
          for (let i = 0; i < pArray.length; i++) {
            const p = pArray[i]
            if (p.value <= 5) {
              tooltipStr += `<br/>${p.marker} ${p.seriesName}: Rank <strong>${p.value}</strong>`
            }
          }
          return tooltipStr
        },
      },
      legend: {
        data: topCorrelations.map((c) => c.name),
        bottom: 0,
        textStyle: { color: '#ccc' },
      },
      grid: {
        top: 20,
        left: 40,
        right: 40,
        bottom: 60,
      },
      xAxis: {
        type: 'category',
        data: windowLabels,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#555' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        inverse: true, // Rank 1 at the top
        min: 1,
        max: 5,
        interval: 1,
        axisLine: { lineStyle: { color: '#555' } },
        splitLine: { lineStyle: { color: '#333' } },
        axisLabel: { formatter: 'Rank {value}' },
      },
      series: series,
    }
  }, [targetBiomarker, correlations, rankedDataMap])

  if (Object.keys(options).length === 0) return null

  return (
    <div className="w-full mt-8">
      <h3 className="text-gray-400 text-sm mb-2 text-center uppercase tracking-wider">
        Correlation Ranking Over Time
      </h3>
      <ReactECharts option={options} style={options.style} notMerge={true} theme="dark" />
    </div>
  )
})
