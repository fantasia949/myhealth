import React, { memo, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useAtomValue } from 'jotai'
import { rankedDataMapAtom } from '../atom/dataAtom'
import { correlationMethodAtom } from '../atom/correlationAtom'
import { CHART_PALETTE } from './Chart2'
import { formattedLabels } from '../data'
import { BumpChartProps } from './BiomarkerCorrelationBumpChart.types'
import { calculatePearson } from '../processors/stats'

export default memo(({ targetBiomarker, correlations, noteValues }: BumpChartProps) => {
  const rankedDataMap = useAtomValue(rankedDataMapAtom)
  const _correlationMethod = useAtomValue(correlationMethodAtom)

  const options = useMemo(() => {
    // Only proceed if we have a target biomarker and correlated supplements
    if (!targetBiomarker || !correlations || correlations.length === 0) return {}

    // ⚡ Bolt Optimization: Replace O(N log N) full sort and slice with an O(N) top-K loop
    // to eliminate intermediate array allocations and avoid sorting thousands of correlations
    // when we only need the top 5.
    const topCorrelations: typeof correlations = []
    for (let i = 0; i < correlations.length; i++) {
      const c = correlations[i]
      const absRho = Math.abs(c.rho)

      let insertIdx = topCorrelations.length
      for (let j = 0; j < topCorrelations.length; j++) {
        if (absRho > Math.abs(topCorrelations[j].rho)) {
          insertIdx = j
          break
        }
      }

      if (insertIdx < 5) {
        topCorrelations.splice(insertIdx, 0, c)
        if (topCorrelations.length > 5) {
          topCorrelations.pop()
        }
      }
    }

    if (topCorrelations.length === 0) return {}

    // ⚡ Bolt Optimization: Pre-allocate target biomarker rank array
    const targetRanks = rankedDataMap.get(targetBiomarker)
    if (!targetRanks) return {}

    const validIndices = new Int32Array(formattedLabels.length)
    let validCount = 0
    for (let i = 0; i < formattedLabels.length; i++) {
      if (!Number.isNaN(targetRanks[i])) {
        validIndices[validCount++] = i
      }
    }
    const count = validCount

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

    const windowedRanksMap = new Map<string, (number | string | null)[]>()
    // ⚡ Bolt Optimization: Avoid pre-allocating 'holey' arrays for generic types.
    for (let i = 0; i < topCorrelations.length; i++) {
      windowedRanksMap.set(topCorrelations[i].name, [])
    }

    // Chunk the valid data indices into windows and recalculate rho for each window
    // ⚡ Bolt Optimization: Pre-extract all valid targetRanks into a single Float64Array
    // outside the loop, avoiding repeated array population and allowing zero-copy subarray views.
    const fullBiomarkerRanks = new Float64Array(count)
    for (let k = 0; k < count; k++) {
      fullBiomarkerRanks[k] = targetRanks[validIndices[k]]
    }

    for (let w = 0; w < numWindowsDynamic; w++) {
      // Use floating point division to distribute elements evenly across windows
      const startIdxInValid = Math.floor((w * count) / numWindowsDynamic)
      const endIdxInValid =
        w === numWindowsDynamic - 1 ? count : Math.floor(((w + 1) * count) / numWindowsDynamic)

      const windowValidIndices = validIndices.subarray(startIdxInValid, endIdxInValid)
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
        for (let i = 0; i < topCorrelations.length; i++) {
          const currentRanks = windowedRanksMap.get(topCorrelations[i].name)!
          const prevRank = w > 0 ? currentRanks[w - 1] : 6
          currentRanks.push(prevRank)
        }
        continue
      }

      const numCorrelations = topCorrelations.length
      const windowRhos: { name: string; rho: number }[] = []

      for (let c = 0; c < numCorrelations; c++) {
        const suppName = topCorrelations[c].name
        const fullVector = suppVectors.get(suppName)!

        // ⚡ Bolt Optimization: Use subarray to create a zero-copy view of the TypedArray
        // instead of re-allocating and copying a new Int8Array for every window.
        const suppVector = fullVector.subarray(startIdxInValid, endIdxInValid)

        let hasSuppVariation = false
        const firstVal = suppVector[0]
        for (let i = 1; i < windowCount; i++) {
          if (suppVector[i] !== firstVal) {
            hasSuppVariation = true
            break
          }
        }

        if (!hasSuppVariation) {
          windowRhos.push({ name: suppName, rho: 0 })
        } else {
          const result = calculatePearson(
            fullBiomarkerRanks.subarray(startIdxInValid, endIdxInValid),
            suppVector,
            {
              alpha: 0.05,
              alternative: 'two-sided',
            },
          )
          windowRhos.push({ name: suppName, rho: Math.abs(result.pcorr || 0) })
        }
      }

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
          currentRanks.push(null)
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

    // Optimization: Replace chained .map() with classic for-loop and push to avoid holey arrays
    const series = []
    const legendData = []
    for (let i = 0; i < topCorrelations.length; i++) {
      const supp = topCorrelations[i]
      legendData.push(supp.name)
      series.push({
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
      })
    }

    // Optimization: Replace .map()
    const xAxisData = []
    for (let i = 0; i < windowLabelsDynamic.length; i++) {
      xAxisData.push(windowLabelsDynamic[i].toString())
    }

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
          const index = parseInt(params[0].axisValue, 10)
          const endIdx =
            index === numWindowsDynamic - 1
              ? count
              : Math.floor(((index + 1) * count) / numWindowsDynamic)
          const startIdx = Math.floor((index * count) / numWindowsDynamic)
          const lIdx = validIndices[endIdx - 1] ?? validIndices[startIdx]
          let tooltipStr = `<strong>${formattedLabels[lIdx] || ''}</strong>`
          const pArray = Array.isArray(params) ? params : [params]
          // ⚡ Bolt Optimization: Replaced O(N log N) Array.sort() with a fast insertion sort
          // Tooltip formatters are hot paths called repeatedly on mouse movement. For very small
          // arrays (N <= 5), avoiding the closure allocation and standard sort reduces GC overhead.
          for (let i = 1; i < pArray.length; i++) {
            let j = i
            while (j > 0 && pArray[j - 1].value > pArray[j].value) {
              const temp = pArray[j]
              pArray[j] = pArray[j - 1]
              pArray[j - 1] = temp
              j--
            }
          }
          for (let i = 0; i < pArray.length; i++) {
            const p = pArray[i]
            if (p.value !== undefined && p.value !== null && p.value <= 5) {
              tooltipStr += `<br/>${p.marker} ${p.seriesName}: Rank <strong>${p.value}</strong>`
            }
          }
          return tooltipStr
        },
      },
      legend: {
        data: legendData,
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
        data: xAxisData,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#555' } },
        splitLine: { show: false },
        axisLabel: {
          formatter: (value: string, index: number) => {
            const endIdx =
              index === numWindowsDynamic - 1
                ? count
                : Math.floor(((index + 1) * count) / numWindowsDynamic)
            const startIdx = Math.floor((index * count) / numWindowsDynamic)
            const lIdx = validIndices[endIdx - 1] ?? validIndices[startIdx]
            return formattedLabels[lIdx] || ''
          },
        },
      },
      yAxis: {
        type: 'value',
        inverse: true, // Rank 1 at the top
        min: 1,
        max: 5,
        interval: 1,
        axisLine: { lineStyle: { color: '#555' } },
        splitLine: { show: false }, // Remove horizontal grid lines
        axisLabel: { formatter: 'Rank {value}' },
      },
      series: series,
    }
  }, [targetBiomarker, correlations, rankedDataMap, noteValues])

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
