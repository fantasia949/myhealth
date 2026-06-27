import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { CHART_PALETTE } from './Chart2'
import { CorrelationResult } from './BiomarkerCorrelation.types'

interface GraphProps {
  biomarkerId: string
  correlations: CorrelationResult[]
}

const BiomarkerCorrelationGraph = React.memo(({ biomarkerId, correlations }: GraphProps) => {
  const options = useMemo(() => {
    if (!correlations || correlations.length === 0) return {}

    const nodes = [
      {
        id: biomarkerId,
        name: biomarkerId,
        symbolSize: 40,
        itemStyle: {
          color: CHART_PALETTE[0],
        },
        label: { show: true, color: '#fff', position: 'top' },
      },
    ]

    const edges: {
      source: string
      target: string
      value: number
      lineStyle: {
        width: number
        curveness: number
        color: string
        opacity: number
      }
    }[] = []

    // ⚡ Bolt Optimization: Replace O(N log N) full sort and slice with an O(N) top-K loop
    // to eliminate intermediate array allocations and avoid sorting thousands of correlations
    // when we only need the top 15 to avoid clutter.
    const topCorr: typeof correlations = []
    for (let i = 0; i < correlations.length; i++) {
      const c = correlations[i]
      const absRho = Math.abs(c.rho)

      let insertIdx = topCorr.length
      for (let j = 0; j < topCorr.length; j++) {
        if (absRho > Math.abs(topCorr[j].rho)) {
          insertIdx = j
          break
        }
      }

      if (insertIdx < 15) {
        topCorr.splice(insertIdx, 0, c)
        if (topCorr.length > 15) {
          topCorr.pop()
        }
      }
    }

    topCorr.forEach((corr) => {
      const isPositive = corr.rho > 0
      const absRho = Math.abs(corr.rho)
      // Exaggerate node size scaling based on absRho (0 to 1) to make differences clearer
      // e.g., an absRho of 0.2 will be roughly 14, an absRho of 0.8 will be roughly 61
      const size = 10 + Math.pow(absRho, 2) * 80

      nodes.push({
        id: corr.name,
        name: corr.name,
        symbolSize: size,
        itemStyle: {
          color: isPositive ? '#10b981' : '#ef4444', // Emerald for positive, red for negative
        },
        label: { show: true, color: '#a3a3a3', position: 'bottom' } as any,
      })

      edges.push({
        source: biomarkerId,
        target: corr.name,
        value: corr.rho,
        lineStyle: {
          // Exaggerate edge thickness as well for stronger visual cues
          width: 1 + Math.pow(absRho, 2) * 8,
          curveness: 0.2,
          color: isPositive ? '#10b981' : '#ef4444',
          opacity: 0.6,
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
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          label: {
            show: true,
          },
          force: {
            repulsion: 150,
            edgeLength: 80,
          },
          data: nodes,
          edges: edges,
        },
      ],
    }
  }, [biomarkerId, correlations])

  if (!correlations || correlations.length === 0) return null

  return (
    <div className="w-full h-[500px] border border-gray-700 rounded bg-dark-bg/50 mt-4 overflow-hidden relative">
      <ReactECharts
        option={options}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        theme="dark"
      />
    </div>
  )
})

export default BiomarkerCorrelationGraph
