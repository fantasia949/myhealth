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
import type { GraphSeriesOption } from 'echarts'

const CorrelationChordDiagram = React.memo(() => {
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

    for (let i = 0; i < numData; i++) {
      nodesSet.add(visibleData[i][0])
    }

    if (method === 'pearson') {
      let maxDatasetLen = 0
      for (let i = 0; i < numData; i++) {
        const len = dataMap.get(visibleData[i][0])?.[1].length || 0
        if (len > maxDatasetLen) maxDatasetLen = len
      }

      const parsedSource = new Float64Array(maxDatasetLen)
      const validIndicesArray = new Int32Array(maxDatasetLen)
      const x = new Float64Array(maxDatasetLen)
      const y = new Float64Array(maxDatasetLen)

      for (let i = 0; i < numData; i++) {
        const sourceName = visibleData[i][0]
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

        for (let j = i + 1; j < numData; j++) {
          const targetName = visibleData[j][0]
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
      // Different styling for Chord diagram edges
      const width = 0.5 + Math.pow(absRho, 4) * 8
      const opacity = 0.1 + absRho * 0.4

      edges.push({
        source: pair.source,
        target: pair.target,
        value: pair.rho,
        lineStyle: {
          width: width,
          curveness: 0.3, // Curve edges across the center
          type: 'solid',
          color: isPositive ? '#10b981' : '#ef4444',
          opacity: opacity,
        },
      })

      degreeMap.set(pair.source, (degreeMap.get(pair.source) || 0) + 1)
      degreeMap.set(pair.target, (degreeMap.get(pair.target) || 0) + 1)
    })

    // Ensure uniqueness of nodeItems in case visibleData has duplicates
    const uniqueNodes = new Map<string, any>()
    visibleData.forEach((item) => {
      const name = item[0]
      if (nodesSet.has(name) && !uniqueNodes.has(name)) {
        uniqueNodes.set(name, {
          name: name,
          degree: degreeMap.get(name) || 0,
          sortTag: item[3]?.sortTag || item[3]?.tag?.[0] || 'ZZZ',
        })
      }
    })

    // Group and sort nodes by Tag to visually cluster them in the circular layout
    const nodeItems = Array.from(uniqueNodes.values())
      .sort((a, b) => a.sortTag.localeCompare(b.sortTag))

    // Assign consistent colors by tag group
    const tagGroups = Array.from(new Set(nodeItems.map((n) => n.sortTag)))
    const tagColors = new Map<string, string>()
    tagGroups.forEach((tag, i) => {
      tagColors.set(tag, CHART_PALETTE[i % CHART_PALETTE.length])
    })

    nodeItems.forEach((node) => {
      const size = 10 + node.degree * 2
      nodes.push({
        id: node.name,
        name: node.name,
        symbolSize: size,
        itemStyle: {
          color: tagColors.get(node.sortTag),
        },
        label: {
          show: true,
          position: 'right',
          color: '#a3a3a3',
          formatter: '{b}',
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
          return params.name
        },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {},
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'circular',
          circular: {
            rotateLabel: true,
          },
          roam: true,
          scaleLimit: { min: 0.1, max: 10 },
          label: {
            show: true,
          },
          data: nodes,
          edges: edges,
        } as GraphSeriesOption,
      ],
    }
  }, [visibleData, dataMap, rankedDataMap, alpha, alternative, method])

  if (!visibleData || visibleData.length === 0) return null

  return (
    <div className="w-full h-[800px] border border-gray-700 rounded bg-dark-bg/50 mt-4 overflow-hidden relative">
      <ReactECharts
        option={options}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        theme="dark"
      />
    </div>
  )
})

export default CorrelationChordDiagram
