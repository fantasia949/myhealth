import { memo, useMemo, useState, useCallback } from 'react'
import { useAtomValue } from 'jotai'
import ReactECharts from 'echarts-for-react'
import { dataMapAtom, rankedDataMapAtom, nonInferredDataAtom } from '../atom/dataAtom'
import {
  correlationAlphaAtom,
  correlationAlternativeAtom,
  correlationMethodAtom,
} from '../atom/correlationAtom'
import { calculateSpearmanRanked, calculatePearson } from '../processors/stats'
import { formattedLabels } from '../data'
import { CHART_PALETTE } from './Chart2'
import { LocalCorrelationBrushLineProps } from './LocalCorrelationBrushLine.types'
import { CORRELATION_EXCLUDED_BIOMARKERS } from '../config/correlations'

export default memo(({ target }: LocalCorrelationBrushLineProps) => {
  const nonInferredData = useAtomValue(nonInferredDataAtom)
  const dataMap = useAtomValue(dataMapAtom)
  const rankedDataMap = useAtomValue(rankedDataMapAtom)
  const alpha = useAtomValue(correlationAlphaAtom)
  const alternative = useAtomValue(correlationAlternativeAtom)
  const method = useAtomValue(correlationMethodAtom)

  // Candidate biomarkers list (non-inferred, non-excluded, excluding target)
  const candidateBiomarkers = useMemo(() => {
    const list: string[] = []
    for (let i = 0; i < nonInferredData.length; i++) {
      const name = nonInferredData[i][0]
      if (name !== target && !CORRELATION_EXCLUDED_BIOMARKERS.includes(name)) {
        list.push(name)
      }
    }
    return list.sort()
  }, [nonInferredData, target])

  // Automatically select the top correlate by default
  const defaultSecondary = useMemo(() => {
    if (candidateBiomarkers.length === 0) return ''

    const options = { alpha, alternative }
    let bestName = candidateBiomarkers[0]
    let bestPVal = Infinity

    if (method === 'pearson') {
      const sourceVal = dataMap.get(target)?.[1]
      if (!sourceVal) return candidateBiomarkers[0]

      const len = sourceVal.length
      const parsedSource = new Float64Array(len)
      const validIndices = new Int32Array(len)
      let count = 0
      for (let i = 0; i < len; i++) {
        const v = sourceVal[i]
        if (v !== null && !isNaN(Number(v))) {
          parsedSource[i] = Number(v)
          validIndices[count++] = i
        }
      }

      const x = new Float64Array(count)
      const y = new Float64Array(count)

      for (const name of candidateBiomarkers) {
        const tVal = dataMap.get(name)?.[1]
        if (!tVal) continue

        let pairCount = 0
        for (let j = 0; j < count; j++) {
          const idx = validIndices[j]
          const t = tVal[idx]
          if (t !== null && !isNaN(Number(t))) {
            x[pairCount] = parsedSource[idx]
            y[pairCount] = Number(t)
            pairCount++
          }
        }
        if (pairCount < 4) continue
        const res = calculatePearson(x.subarray(0, pairCount), y.subarray(0, pairCount), options)
        if (res.pValue < bestPVal) {
          bestPVal = res.pValue
          bestName = name
        }
      }
    } else {
      const sourceRanks = rankedDataMap.get(target)
      if (!sourceRanks) return candidateBiomarkers[0]

      for (const name of candidateBiomarkers) {
        const targetRanks = rankedDataMap.get(name)
        if (!targetRanks) continue
        const res = calculateSpearmanRanked(sourceRanks, targetRanks, options)
        if (res.pValue < bestPVal) {
          bestPVal = res.pValue
          bestName = name
        }
      }
    }

    return bestName
  }, [candidateBiomarkers, target, method, alpha, alternative, dataMap, rankedDataMap])

  const [selectedSecondary, setSelectedSecondary] = useState<string>('')
  const secondary = selectedSecondary || defaultSecondary

  // Brush state: startIndex and endIndex in formattedLabels array
  const [brushedRange, setBrushedRange] = useState<[number, number] | null>(null)

  // Align trajectories over formattedLabels
  const trajectoryData = useMemo(() => {
    if (!target || !secondary) return null

    const targetRanks = rankedDataMap.get(target)
    const secondaryRanks = rankedDataMap.get(secondary)
    const targetRaw = dataMap.get(target)?.[1]
    const secondaryRaw = dataMap.get(secondary)?.[1]

    if (!targetRanks || !secondaryRanks) return null

    const len = formattedLabels.length
    const series1: [string, number | null][] = []
    const series2: [string, number | null][] = []

    for (let i = 0; i < len; i++) {
      const dateLabel = formattedLabels[i]
      const r1 = targetRanks[i]
      const r2 = secondaryRanks[i]

      // Determine valid data point based on raw values
      const isValid1 = targetRaw && targetRaw[i] !== null && !isNaN(Number(targetRaw[i]))
      const isValid2 = secondaryRaw && secondaryRaw[i] !== null && !isNaN(Number(secondaryRaw[i]))

      series1.push([dateLabel, isValid1 ? r1 : null])
      series2.push([dateLabel, isValid2 ? r2 : null])
    }

    return { series1, series2, targetRaw, secondaryRaw, targetRanks, secondaryRanks }
  }, [target, secondary, rankedDataMap, dataMap])

  // Compute local or overall correlation stats
  const stats = useMemo(() => {
    if (!trajectoryData || !target || !secondary) return null

    const { targetRaw, secondaryRaw, targetRanks, secondaryRanks } = trajectoryData
    const options = { alpha, alternative }

    const startIndex = brushedRange ? Math.max(0, brushedRange[0]) : 0
    const endIndex = brushedRange ? Math.min(formattedLabels.length - 1, brushedRange[1]) : formattedLabels.length - 1

    if (method === 'pearson') {
      if (!targetRaw || !secondaryRaw) return null
      const xVals: number[] = []
      const yVals: number[] = []

      for (let i = startIndex; i <= endIndex; i++) {
        const v1 = targetRaw[i]
        const v2 = secondaryRaw[i]
        if (v1 !== null && v2 !== null && !isNaN(Number(v1)) && !isNaN(Number(v2))) {
          xVals.push(Number(v1))
          yVals.push(Number(v2))
        }
      }

      if (xVals.length < 3) {
        return { pcorr: 0, pValue: 1, n: xVals.length, isSignificant: false, isBrushed: !!brushedRange }
      }

      const res = calculatePearson(new Float64Array(xVals), new Float64Array(yVals), options)
      return {
        pcorr: res.pcorr,
        pValue: res.pValue,
        n: xVals.length,
        isSignificant: res.pValue <= alpha,
        isBrushed: !!brushedRange,
      }
    } else {
      const xRanks: number[] = []
      const yRanks: number[] = []

      for (let i = startIndex; i <= endIndex; i++) {
        const v1 = targetRaw?.[i]
        const v2 = secondaryRaw?.[i]
        if (v1 !== null && v2 !== null && !isNaN(Number(v1)) && !isNaN(Number(v2))) {
          xRanks.push(targetRanks[i])
          yRanks.push(secondaryRanks[i])
        }
      }

      if (xRanks.length < 3) {
        return { pcorr: 0, pValue: 1, n: xRanks.length, isSignificant: false, isBrushed: !!brushedRange }
      }

      const res = calculateSpearmanRanked(new Float64Array(xRanks), new Float64Array(yRanks), options)
      return {
        pcorr: res.pcorr,
        pValue: res.pValue,
        n: xRanks.length,
        isSignificant: res.pValue <= alpha,
        isBrushed: !!brushedRange,
      }
    }
  }, [trajectoryData, target, secondary, method, alpha, alternative, brushedRange])

  // Handle brush event from ECharts
  const onBrushSelected = useCallback((params: any) => {
    const brushComponent = params.batch?.[0]
    if (!brushComponent || !brushComponent.areas || brushComponent.areas.length === 0) {
      setBrushedRange(null)
      return
    }

    const area = brushComponent.areas[0]
    if (area && area.coordRange && area.coordRange.length >= 2) {
      const startIdx = Math.round(area.coordRange[0])
      const endIdx = Math.round(area.coordRange[1])
      setBrushedRange([Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)])
    }
  }, [])

  const echartsEvents = useMemo(() => {
    return {
      brushSelected: onBrushSelected,
    }
  }, [onBrushSelected])

  // ECharts options
  const option = useMemo(() => {
    if (!trajectoryData) return {}

    const markAreaPoints = []
    if (brushedRange && stats && stats.isSignificant) {
      const startLabel = formattedLabels[brushedRange[0]]
      const endLabel = formattedLabels[brushedRange[1]]
      markAreaPoints.push([
        {
          xAxis: startLabel,
          itemStyle: {
            color: 'rgba(59, 130, 246, 0.25)', // Subtle blue highlight
            borderColor: 'rgba(59, 130, 246, 0.6)',
            borderWidth: 1,
          },
        },
        {
          xAxis: endLabel,
        },
      ])
    }

    return {
      style: { height: 380, width: '100%' },
      theme: 'dark',
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#111111',
        borderColor: '#3a3a3a80',
        textStyle: { color: '#f0f0f0' },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return ''
          const dateStr = params[0].name
          let html = `<strong>${dateStr}</strong><br/>`
          for (const p of params) {
            const val = p.value?.[1]
            const displayVal = val !== null && val !== undefined ? Number(val).toFixed(2) : 'N/A'
            html += `${p.marker} ${p.seriesName}: <strong>${displayVal}</strong><br/>`
          }
          return html
        },
      },
      legend: {
        data: [target, secondary],
        textStyle: { color: '#e5e7eb' },
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '15%',
        containLabel: true,
      },
      brush: {
        toolbox: ['lineX', 'clear'],
        xAxisIndex: 0,
        brushLink: 'all',
        outOfBrush: {
          colorAlpha: 0.3,
        },
        brushStyle: {
          borderWidth: 1,
          color: 'rgba(59, 130, 246, 0.15)',
          borderColor: 'rgba(59, 130, 246, 0.8)',
        },
      },
      xAxis: {
        type: 'category',
        data: formattedLabels,
        axisLine: { lineStyle: { color: '#4b5563' } },
        axisLabel: { color: '#9ca3af', rotate: 30, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: 'Spearman Rank',
        nameLocation: 'middle',
        nameGap: 40,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
        axisLabel: { color: '#9ca3af' },
      },
      series: [
        {
          name: target,
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: trajectoryData.series1,
          lineStyle: { width: 2, color: CHART_PALETTE[7] }, // Blue
          itemStyle: { color: CHART_PALETTE[7] },
          markArea: {
            silent: true,
            data: markAreaPoints,
          },
        },
        {
          name: secondary,
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: trajectoryData.series2,
          lineStyle: { width: 2, color: CHART_PALETTE[3] }, // Amber/Orange
          itemStyle: { color: CHART_PALETTE[3] },
        },
      ],
    }
  }, [trajectoryData, target, secondary, brushedRange, stats])

  if (candidateBiomarkers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        No additional biomarkers available for time-window correlation comparison.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Selector & Badge controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-dark-bg/60 p-3 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-2">
          <label htmlFor="secondary-biomarker-select" className="text-xs font-medium text-gray-300">
            Compare with:
          </label>
          <select
            id="secondary-biomarker-select"
            value={secondary}
            onChange={(e) => setSelectedSecondary(e.target.value)}
            className="px-2 py-1 bg-dark-bg border border-gray-600 rounded text-xs text-white focus:border-blue-500 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer max-w-[200px] truncate"
          >
            {candidateBiomarkers.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Summary Badge */}
        {stats && (
          <div
            className={`px-3 py-1.5 rounded text-xs font-mono border flex items-center gap-2 ${
              stats.isSignificant
                ? 'bg-blue-900/30 border-blue-500/50 text-blue-300'
                : 'bg-gray-800/50 border-gray-700 text-gray-400'
            }`}
          >
            <span className="font-sans font-semibold text-gray-300">
              {stats.isBrushed ? 'Brushed Window' : 'Full Timeline'}:
            </span>
            <span>
              {method === 'pearson' ? 'r' : 'ρ'}: <strong>{stats.pcorr.toFixed(3)}</strong>
            </span>
            <span>
              p: <strong>{stats.pValue < 0.001 ? '< 0.001' : stats.pValue.toFixed(4)}</strong>
            </span>
            <span>
              N: <strong>{stats.n}</strong>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-sans font-bold ${
                stats.isSignificant
                  ? 'bg-green-800/80 text-green-200'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {stats.isSignificant ? 'Significant' : 'Non-sig'}
            </span>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400 flex justify-between items-center px-1">
        <span>Drag/brush horizontally on the chart to analyze a local time window.</span>
        {brushedRange && (
          <button
            type="button"
            onClick={() => setBrushedRange(null)}
            className="text-xs text-blue-400 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1"
          >
            Clear Brush Selection
          </button>
        )}
      </div>

      <div className="relative border border-gray-800 rounded-lg p-2 bg-black/20">
        <ReactECharts
          option={option}
          style={option.style}
          theme="dark"
          notMerge={true}
          onEvents={echartsEvents}
        />
      </div>
    </div>
  )
})
