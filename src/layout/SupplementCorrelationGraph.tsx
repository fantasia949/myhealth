import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { CHART_PALETTE } from './Chart2'
import { SupplementCorrelationResult } from './SupplementCorrelation.types'

interface GraphProps {
  supplementName: string
  correlations: SupplementCorrelationResult[]
}

const SupplementCorrelationGraph = React.memo(({ supplementName, correlations }: GraphProps) => {
  const options = useMemo(() => {
    if (!correlations || correlations.length === 0) return {}

    const nodes = [
      {
        id: supplementName,
        name: supplementName,
        symbolSize: 40,
        itemStyle: {
          color: CHART_PALETTE[0],
        },
        label: { show: true, color: '#fff', position: 'top' },
      },
    ]

    const edges: any[] = []

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

    // ⚡ Bolt Optimization: Replace .forEach() with a standard for-loop to eliminate closure allocation overhead.
    for (let i = 0; i < topCorr.length; i++) {
      const c = topCorr[i]
      nodes.push({
        id: c.name,
        name: c.name,
        symbolSize: Math.max(15, Math.abs(c.rho) * 50),
        itemStyle: {
          color: CHART_PALETTE[0],
        },
        label: { show: true, color: '#aaa', position: 'bottom' },
        rho: c.rho,
        pValue: c.pValue,
      } as any)

      edges.push({
        source: supplementName,
        target: c.name,
        lineStyle: {
          width: Math.max(1, Math.pow(Math.abs(c.rho), 2) * 10),
          curveness: 0.2,
          opacity: c.pValue <= 0.05 ? 0.8 : 0.2,
        },
      })
    }

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            if (params.name === supplementName) return params.name

            // ⚡ Bolt Optimization: Replaced O(N) Array.find() inside the tooltip formatter
            // with O(1) direct property access. Tooltip formatters fire continuously on mousemove,
            // making Array.find an expensive operation that can cause main thread hitching.
            if (params.data && params.data.rho !== undefined && params.data.pValue !== undefined) {
              return `${params.name}<br/>Rho: <strong>${params.data.rho.toFixed(
                4,
              )}</strong><br/>P-Value: <strong>${params.data.pValue.toFixed(4)}</strong>`
            }
          }
          return ''
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          edges: edges,
          roam: true,
          label: {
            position: 'right',
          },
          force: {
            repulsion: 200,
            edgeLength: 100,
          },
        },
      ],
    }
  }, [supplementName, correlations])

  return (
    <ReactECharts
      option={options}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'svg' }}
      notMerge={true}
    />
  )
})

export default SupplementCorrelationGraph
