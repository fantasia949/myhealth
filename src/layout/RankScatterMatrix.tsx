import { memo, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { rankedDataMapAtom } from '../atom/dataAtom'
import ReactECharts from 'echarts-for-react'
import type {
  GridComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
  ScatterSeriesOption,
  TooltipComponentOption,
} from 'echarts'
import { CHART_PALETTE } from './Chart2'
import { formattedLabels } from '../data'
import { RankScatterMatrixProps } from './RankScatterMatrix.types'

export default memo(({ keys }: RankScatterMatrixProps) => {
  const rankedDataMap = useAtomValue(rankedDataMapAtom)

  const options = useMemo(() => {
    const numVars = keys.length
    if (numVars < 2 || numVars > 5) return null

    const datasetSource: any[][] = []
    const headerRow: any[] = ['Date']
    for (let i = 0; i < numVars; i++) {
      headerRow.push(keys[i])
    }
    datasetSource.push(headerRow)

    const rankArrays = []
    let maxLen = 0
    for (let i = 0; i < numVars; i++) {
      const arr = rankedDataMap.get(keys[i])
      rankArrays.push(arr)
      if (arr && arr.length > maxLen) {
        maxLen = arr.length
      }
    }

    if (maxLen === 0) return null

    for (let i = 0; i < maxLen; i++) {
      let isValidRow = true
      const row: any[] = [formattedLabels[i] || `Point ${i}`]
      for (let j = 0; j < numVars; j++) {
        const arr = rankArrays[j]
        const val = arr ? arr[i] : NaN
        if (Number.isNaN(val) || val === null || val === undefined) {
          isValidRow = false
          break
        }
        row.push(val)
      }
      if (isValidRow) {
        datasetSource.push(row)
      }
    }

    if (datasetSource.length <= 1) return null // Only header

    const grids: GridComponentOption[] = []
    const xAxes: XAXisComponentOption[] = []
    const yAxes: YAXisComponentOption[] = []
    const series: ScatterSeriesOption[] = []

    // Matrix calculation
    // Left padding: 50, right padding: 20
    // Top padding: 50, bottom padding: 50
    // Gap: 10%
    const gap = numVars > 3 ? 5 : 10
    const cellWidth = (100 - gap * (numVars - 1)) / numVars
    const cellHeight = (100 - gap * (numVars - 1)) / numVars

    for (let i = 0; i < numVars; i++) {
      for (let j = 0; j < numVars; j++) {
        const gridIndex = i * numVars + j

        // Calculate grid position using percentage
        grids.push({
          left: `${j * (cellWidth + gap)}%`,
          top: `${i * (cellHeight + gap)}%`,
          width: `${cellWidth}%`,
          height: `${cellHeight}%`,
        })

        const showXLabel = i === numVars - 1
        const showYLabel = j === 0

        xAxes.push({
          gridIndex: gridIndex,
          type: 'value',
          scale: true,
          name: showXLabel ? keys[j] : '',
          nameLocation: 'middle',
          nameGap: 30,
          splitLine: { show: false },
          axisLabel: { show: showXLabel },
          axisTick: { show: showXLabel },
          axisLine: { show: true, lineStyle: { color: '#666' } },
        })

        yAxes.push({
          gridIndex: gridIndex,
          type: 'value',
          scale: true,
          name: showYLabel ? keys[i] : '',
          nameLocation: 'middle',
          nameGap: 30,
          splitLine: { show: false },
          axisLabel: { show: showYLabel },
          axisTick: { show: showYLabel },
          axisLine: { show: true, lineStyle: { color: '#666' } },
        })

        if (i !== j) {
          series.push({
            type: 'scatter',
            xAxisIndex: gridIndex,
            yAxisIndex: gridIndex,
            encode: {
              x: j + 1, // +1 because dataset starts with Date
              y: i + 1,
              tooltip: [0, j + 1, i + 1],
            },
            itemStyle: {
              color: CHART_PALETTE[gridIndex % CHART_PALETTE.length],
              opacity: 0.7,
            },
            symbolSize: 6,
          })
        }
      }
    }

    const opt = {
      theme: 'dark',
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#111111',
        borderColor: '#3a3a3a80',
        textStyle: {
          color: '#f0f0f0',
        },
        formatter: (params: any) => {
          if (params.value) {
            const date = params.value[0]
            const valX = params.value[params.encode.x[0]]
            const valY = params.value[params.encode.y[0]]
            const nameX = keys[params.encode.x[0] - 1]
            const nameY = keys[params.encode.y[0] - 1]
            return `<strong>${date}</strong><br/>${params.marker} ${nameX}: <strong>${valX}</strong><br/>${params.marker} ${nameY}: <strong>${valY}</strong>`
          }
          return ''
        },
      } as TooltipComponentOption,
      dataset: {
        source: datasetSource,
      },
      grid: grids,
      xAxis: xAxes,
      yAxis: yAxes,
      series: series,
    }

    return opt
  }, [keys, rankedDataMap])

  if (!options) return null

  return (
    <div className="w-full mt-8 px-8 py-4 border-t border-gray-800">
      <h3 className="text-gray-400 text-sm mb-4 text-center uppercase tracking-wider">
        Correlation Rank Scatter Matrix
      </h3>
      <div className="relative w-full aspect-square max-h-[800px] mx-auto">
        <ReactECharts
          option={options}
          style={{ height: '100%', width: '100%' }}
          theme="dark"
          notMerge={true}
        />
      </div>
    </div>
  )
})
