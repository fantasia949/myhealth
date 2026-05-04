import React, { memo, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useAtomValue } from 'jotai'
import { rankedDataMapAtom } from '../atom/dataAtom'
import { correlationMethodAtom } from '../atom/correlationAtom'
import { CHART_PALETTE } from './Chart2'
import { formattedLabels } from '../data'
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

    if (topCorrelations.length === 0) return {}

    // ⚡ Bolt Optimization: Pre-allocate target biomarker rank array
    const targetRanks = rankedDataMap.get(targetBiomarker)
    if (!targetRanks) return {}

    const validIndices: number[] = []
    for (let i = 0; i < formattedLabels.length; i++) {
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

    // Dynamic number of windows based on actual valid data points to ensure enough data per window
    // Aim for 5 windows, but fallback to fewer if data is sparse. Require at least 2 points per window.
    const numWindowsDynamic = count >= 30 ? 5 : count >= 10 ? 3 : count >= 4 ? 2 : 1
    const windowLabelsDynamic: string[] = []

    const windowedRanksMap = new Map<string, (number | string)[]>()
    topCorrelations.forEach((supp) => windowedRanksMap.set(supp.name, []))

    // Chunk the valid data indices into windows and recalculate rho for each window
    for (let w = 0; w < numWindowsDynamic; w++) {
      // Use floating point division to distribute elements evenly across windows
      const startIdxInValid = Math.floor((w * count) / numWindowsDynamic)
      const endIdxInValid = w === numWindowsDynamic - 1 ? count : Math.floor(((w + 1) * count) / numWindowsDynamic)

      const windowValidIndices = validIndices.slice(startIdxInValid, endIdxInValid)
      const windowCount = windowValidIndices.length

      // Use the last date of the window for the label so we can see the time span


      // Map to a complex object with a unique value to bypass category duplication,
      // and use a formatter to display the clean label.
      windowLabelsDynamic.push(w.toString())

      // Without variation in the binary supplement vector (e.g. they took it every day, or never),
      // correlation is technically 0/undefined.
      // But we still want to plot a line across windows even if data is sparse,
      // otherwise ECharts won't connect the disjointed valid segments properly.
      if (windowCount < 2) {
        // Fall back to previous rank so line stays flat (or 6 if first) so the line doesn't break
        topCorrelations.forEach((supp) => {
          const currentRanks = windowedRanksMap.get(supp.name)!
          const prevRank = currentRanks.length > 0 ? currentRanks[currentRanks.length - 1] : 6
          currentRanks.push(prevRank)
        })
        continue
      }

      const windowBiomarkerRanks = new Float64Array(windowCount)
      const windowSuppVectors = new Map<string, Int8Array>()
      topCorrelations.forEach((supp) =>
        windowSuppVectors.set(supp.name, new Int8Array(windowCount)),
      )

      // Extract vectors for this specific window using our pre-calculated valid chunk
      for (let k = 0; k < windowCount; k++) {
        const globalK = startIdxInValid + k
        const globalI = validIndices[globalK]
        windowBiomarkerRanks[k] = targetRanks[globalI]
        topCorrelations.forEach((supp) => {
          windowSuppVectors.get(supp.name)![k] = suppVectors.get(supp.name)![globalK]
        })
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

      // Assign ranks (1 to 5), but handle ties appropriately or use '-' for connectNulls
      let currentRank = 1
      for (let i = 0; i < windowRhos.length; i++) {
        const wr = windowRhos[i]
        const currentRanks = windowedRanksMap.get(wr.name)!

        // If rho is exactly 0 and no variation existed, we omit the rank by pushing null
        // to avoid erratic jumps. connectNulls: true will bridge the gaps cleanly.
        if (wr.rho === 0) {
          currentRanks.push(null as any) // Type assertion to bypass TS if needed, we typed it as (number | string)[]
        } else {
          // Check for ties with the previous item
          if (i > 0 && Math.abs(windowRhos[i].rho - windowRhos[i - 1].rho) < 1e-9) {
            // Same rank as previous
          } else {
            currentRank = i + 1
          }
          currentRanks.push(currentRank)
        }
      }
    }

    const series = topCorrelations.map((supp) => {
      return {
        name: supp.name,
        type: 'line',
        smooth: true,
        connectNulls: true,
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
        data: windowLabelsDynamic.map((w) => w.toString()),
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#555' } },
        splitLine: { show: false },
        axisLabel: {
          formatter: (value: string, index: number) => {
            const endIdx = index === numWindowsDynamic - 1 ? count : Math.floor(((index + 1) * count) / numWindowsDynamic)
            const startIdx = Math.floor((index * count) / numWindowsDynamic)
            const lIdx = validIndices[endIdx - 1] ?? validIndices[startIdx]
            return formattedLabels[lIdx] || ''
          }
        }
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

  if (Object.keys(options).length === 0) {
    return (
      <div className="w-full mt-8 text-center text-gray-400">
        <h3 className="text-sm mb-2 uppercase tracking-wider">Correlation Ranking Over Time</h3>
        <p className="mt-4 text-sm italic">Insufficient data for timeline</p>
      </div>
    )
  }

  return (
    <div className="w-full mt-8">
      <h3 className="text-gray-400 text-sm mb-2 text-center uppercase tracking-wider">
        Correlation Ranking Over Time
      </h3>
      <ReactECharts option={options} style={options.style} theme="dark" />
    </div>
  )
})
