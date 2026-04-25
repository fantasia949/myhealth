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

    // Sort and take top 15 to avoid clutter
    const topCorr = [...correlations].sort((a, b) => Math.abs(b.rho) - Math.abs(a.rho)).slice(0, 15)

    topCorr.forEach((c) => {
      nodes.push({
        id: c.name,
        name: c.name,
        symbolSize: Math.max(15, Math.abs(c.rho) * 50),
        itemStyle: {
          color: CHART_PALETTE[0],
        },
        label: { show: true, color: '#aaa', position: 'bottom' },
      })

      edges.push({
        source: supplementName,
        target: c.name,
        lineStyle: {
          width: Math.max(1, Math.pow(Math.abs(c.rho), 2) * 10),
          curveness: 0.2,
          opacity: c.pValue <= 0.05 ? 0.8 : 0.2,
        },
      })
    })

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            if (params.name === supplementName) return params.name
            const corr = correlations.find((c) => c.name === params.name)
            if (corr) {
              return `${params.name}<br/>Rho: <strong>${corr.rho.toFixed(
                4,
              )}</strong><br/>P-Value: <strong>${corr.pValue.toFixed(4)}</strong>`
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
