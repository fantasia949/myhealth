import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useAtomValue } from 'jotai'
import { nonInferredDataAtom, dataMapAtom, rankedDataMapAtom } from '../atom/dataAtom'
import {
  correlationAlphaAtom,
  correlationAlternativeAtom,
  correlationMethodAtom,
} from '../atom/correlationAtom'
import { calculateSpearmanRanked, calculatePearson } from '../processors/stats'
import { CHART_PALETTE } from './Chart2'

const CorrelationNetworkChart = React.memo(() => {
  const visibleData = useAtomValue(nonInferredDataAtom)
  const dataMap = useAtomValue(dataMapAtom)
  const rankedDataMap = useAtomValue(rankedDataMapAtom)
  const alpha = useAtomValue(correlationAlphaAtom)
  const alternative = useAtomValue(correlationAlternativeAtom)
  const method = useAtomValue(correlationMethodAtom)

  const options = useMemo(() => {
    if (!visibleData || visibleData.length === 0) return {}

    const nodes: any[] = []
    const edges: any[] = []
    const nodesSet = new Set<string>()

    const options = { alpha, alternative }
    const validPairs: { source: string; target: string; rho: number; pValue: number }[] = []

    const numData = visibleData.length

    // Create nodes for all visible data
    for (let i = 0; i < numData; i++) {
      const item = visibleData[i]
      nodesSet.add(item[0])
    }

    if (method === 'pearson') {
      // Pre-parse the source values and record valid indices to avoid O(N * M) parsing and null checks.
      // This is complex for N*N matrix, so we'll do it pair-wise carefully.

      for (let i = 0; i < numData; i++) {
        const sourceName = visibleData[i][0]
        const sourceValuesRaw = dataMap.get(sourceName)?.[1]
        if (!sourceValuesRaw) continue

        const len = sourceValuesRaw.length
        const parsedSource = new Float64Array(len)
        const validIndices: number[] = []

        for (let k = 0; k < len; k++) {
          const v = sourceValuesRaw[k]
          if (v !== null) {
            const vNum = Number(v)
            if (!isNaN(vNum)) {
              parsedSource[k] = vNum
              validIndices.push(k)
            }
          }
        }

        const maxLen = validIndices.length
        if (maxLen < 4) continue

        const x = new Float64Array(maxLen)
        const y = new Float64Array(maxLen)

        for (let j = i + 1; j < numData; j++) {
          const targetName = visibleData[j][0]
          const targetValuesRaw = dataMap.get(targetName)?.[1]
          if (!targetValuesRaw) continue

          let count = 0
          for (let k = 0; k < maxLen; k++) {
            const idx = validIndices[k]
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

          const result = calculatePearson(x.subarray(0, count), y.subarray(0, count), options)
          if (result.pValue <= alpha) {
            validPairs.push({
              source: sourceName,
              target: targetName,
              rho: result.pcorr,
              pValue: result.pValue,
            })
          }
        }
      }
    } else {
      // Spearman
      for (let i = 0; i < numData; i++) {
        const sourceName = visibleData[i][0]
        const sourceRanks = rankedDataMap.get(sourceName)
        if (!sourceRanks) continue

        for (let j = i + 1; j < numData; j++) {
          const targetName = visibleData[j][0]
          const targetRanks = rankedDataMap.get(targetName)
          if (!targetRanks) continue

          const result = calculateSpearmanRanked(sourceRanks, targetRanks, options)
          if (result.pValue <= alpha) {
            validPairs.push({
              source: sourceName,
              target: targetName,
              rho: result.pcorr,
              pValue: result.pValue,
            })
          }
        }
      }
    }

    const degreeMap = new Map<string, number>()

    validPairs.forEach((pair) => {
      const isPositive = pair.rho > 0
      const absRho = Math.abs(pair.rho)
      const width = 0.5 + Math.pow(absRho, 4) * 8
      const opacity = 0.1 + absRho * 0.4

      edges.push({
        source: pair.source,
        target: pair.target,
        value: pair.rho,
        lineStyle: {
          width: width,
          curveness: 0.15,
          type: 'solid',
          color: isPositive ? '#10b981' : '#ef4444',
          opacity: opacity,
        },
      })

      degreeMap.set(pair.source, (degreeMap.get(pair.source) || 0) + 1)
      degreeMap.set(pair.target, (degreeMap.get(pair.target) || 0) + 1)
    })

    // Add nodes
    // Dummy background node to capture roam events everywhere
    nodes.push({
      id: '__bg_1',
      name: '',
      fixed: true,
      x: 0,
      y: 0,
      symbolSize: 0,
      itemStyle: { opacity: 0 },
    })
    nodes.push({
      id: '__bg_2',
      name: '',
      fixed: true,
      x: 2000,
      y: 2000,
      symbolSize: 0,
      itemStyle: { opacity: 0 },
    })

    Array.from(nodesSet).forEach((nodeName, index) => {
      const degree = degreeMap.get(nodeName) || 0
      if (degree === 0) return
      const size = 15 + degree * 2 // Node size proportional to connections
      const colorIndex = index % CHART_PALETTE.length

      // Hide nodes with 0 connections if there are many nodes?
      // We'll show all to maintain "entire web", but make them small.
      nodes.push({
        id: nodeName,
        name: nodeName,
        symbolSize: size,
        itemStyle: {
          color: CHART_PALETTE[colorIndex],
        },
        label: {
          show: degree > 0, // only show labels for connected nodes to avoid clutter
          color: '#a3a3a3',
          position: 'bottom',
        },
      })
    })

    return {
      theme: 'dark',
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: '#111111',
        borderColor: '#3a3a3a80',
        textStyle: { color: '#f0f0f0' },
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            const rho = (params.data.value as number).toFixed(3)
            return `${params.data.source} ↔ ${params.data.target}<br/>Rho: <strong>${rho}</strong>`
          }
          return params.id && params.id.startsWith('__') ? '' : params.name
        },
      },
      toolbox: {
        show: true,
        feature: {
          restore: {},
          saveAsImage: {},
        },
      },
      series: [
        {
          type: 'graph',
          width: '100%',
          height: '100%',
          top: '0%',
          bottom: '0%',
          left: '0%',
          right: '0%',
          initLayout: 'circular',
          layoutAnimation: true,
          layout: 'force',
          roam: true,
          scaleLimit: { min: 0.1, max: 10 },
          draggable: false,

          label: {
            show: true,
          },
          force: {
            repulsion: [3000, 5000],
            edgeLength: [150, 400],
            gravity: 0.05,
            friction: 0.2,
          },
          data: nodes,
          edges: edges,
        },
      ],
    }
  }, [visibleData, dataMap, rankedDataMap, alpha, alternative, method])

  if (!visibleData || visibleData.length === 0) return null

  return (
    <div className="w-full h-[600px] border border-gray-700 rounded bg-dark-bg/50 mt-4 overflow-hidden relative">
      <ReactECharts
        option={options}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        theme="dark"
      />
    </div>
  )
})

export default CorrelationNetworkChart
