import { memo, useMemo, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import * as ecStat from 'echarts-stat'
import { useAtomValue } from 'jotai'
import { noteValuesAtom, nonInferredDataAtom } from '../atom/dataAtom'
import { Fragment } from 'react'

echarts.registerTransform(
  (ecStat as any).transform?.clustering ||
    (ecStat as any).default?.transform?.clustering ||
    (ecStat as any).clustering,
)

interface SystemClusteringProps {
  isOpen: boolean
  onClose: () => void
}

export const CHART_PALETTE = [
  '#c23531',
  '#ADD4EF',
  '#BFDAA7',
  '#FCAC65',
  '#C6C1D2',
  '#7598E4',
  '#CF6D6C',
  '#4979CF',
  '#E1934B',
  '#829649',
  '#7D70AC',
  '#2559B7',
]

const echartsOptions: any = {
  style: { height: 600, width: '100%' },
  theme: 'dark',
  backgroundColor: 'transparent',
  color: CHART_PALETTE,
  tooltip: {
    position: 'top',
    backgroundColor: '#111111',
    borderColor: '#3a3a3a80',
    textStyle: { color: '#f0f0f0' },
    formatter: (params: any) => {
      if (params.seriesType === 'scatter') {
        const val1 = params.value[0] !== undefined ? params.value[0].toFixed(0) + '%' : '-'
        const val2 = params.value[1] !== undefined ? params.value[1].toFixed(0) + '%' : '-'
        const supps = params.value[2] ? params.value[2] : 'None'
        const date = params.value[3] ? params.value[3] : ''
        return `<strong>${date}</strong><br/>Supplements: <strong>${supps}</strong><br/>X Optimality: ${val1}<br/>Y Optimality: ${val2}`
      }
      return params.name || ''
    },
  },
  xAxis: {
    type: 'value',
    name: 'Component 1',
    scale: true,
    splitLine: { lineStyle: { color: '#333' } },
  },
  yAxis: {
    type: 'value',
    name: 'Component 2',
    scale: true,
    splitLine: { lineStyle: { color: '#333' } },
  },
  dataset: [],
  series: [],
}

const SystemClustering = memo(({ isOpen, onClose }: SystemClusteringProps) => {
  const data = useAtomValue(nonInferredDataAtom)
  const noteValues = useAtomValue(noteValuesAtom)

  const availableTags = useMemo(() => {
    if (!data) return []
    const tags = new Set<string>()
    data.forEach((item) => {
      item[3]?.tag?.forEach((t) => tags.add(t))
    })
    return Array.from(tags).sort()
  }, [data])

  const [xAxisTag, setXAxisTag] = useState<string>('')
  const [yAxisTag, setYAxisTag] = useState<string>('')

  // Set defaults when tags load
  useEffect(() => {
    if (availableTags.length > 0) {
      if (!xAxisTag)
        setXAxisTag(availableTags.find((t) => t.includes('2-Metabolic')) || availableTags[0] || '')
      if (!yAxisTag)
        setYAxisTag(
          availableTags.find((t) => t.includes('3-Liver') || t.includes('4-Lipid')) ||
            availableTags[1] ||
            availableTags[0] ||
            '',
        )
    }
  }, [availableTags, xAxisTag, yAxisTag])

  const options = useMemo(() => {
    if (!data || data.length === 0 || !noteValues || noteValues.length === 0) return echartsOptions

    // 1. Prepare matrix: we need numeric arrays for each valid timepoint
    // We only use timepoints where we have measurements for most markers
    const numMarkers = data.length
    const numTimepoints = data[0][1].length

    const timepoints = []

    // Only process a subset of markers (Metabolic vs Liver/Lipid) to avoid mixing disparate units
    const m1Indices: number[] = []
    const m2Indices: number[] = []

    for (let m = 0; m < numMarkers; m++) {
      const tags = data[m][3]?.tag || []
      if (xAxisTag && tags.includes(xAxisTag)) m1Indices.push(m)
      if (yAxisTag && tags.includes(yAxisTag)) m2Indices.push(m)
    }

    for (let t = 0; t < numTimepoints; t++) {
      let m1Valid = 0
      let m1Optimal = 0
      let m2Valid = 0
      let m2Optimal = 0

      // Fallback: If we don't have enough markers in tags, just use the first half vs second half
      const useTags =
        xAxisTag !== '' && yAxisTag !== '' && m1Indices.length > 0 && m2Indices.length > 0
      const g1 = useTags
        ? m1Indices
        : Array.from({ length: Math.floor(numMarkers / 2) }, (_, i) => i)
      const g2 = useTags
        ? m2Indices
        : Array.from(
            { length: Math.ceil(numMarkers / 2) },
            (_, i) => i + Math.floor(numMarkers / 2),
          )

      for (const m of g1) {
        const val = data[m][1][t]
        if (val !== null && typeof val !== 'undefined' && (val as string | number) !== '') {
          const num = Number(val)
          if (!isNaN(num)) {
            m1Valid++
            // optimality array is true if optimal
            if (data[m][3]?.optimality?.[t] === true) {
              m1Optimal++
            }
          }
        }
      }
      for (const m of g2) {
        const val = data[m][1][t]
        if (val !== null && typeof val !== 'undefined' && (val as string | number) !== '') {
          const num = Number(val)
          if (!isNaN(num)) {
            m2Valid++
            if (data[m][3]?.optimality?.[t] === true) {
              m2Optimal++
            }
          }
        }
      }

      // We need at least one valid reading in both groups to place a point on a 2D scatter
      if (m1Valid > 0 && m2Valid > 0) {
        const m1Score = (m1Optimal / m1Valid) * 100
        const m2Score = (m2Optimal / m2Valid) * 100

        // Ensure we properly map notes depending on the type
        const rawNote: any = noteValues[t]
        const supps =
          rawNote && rawNote.supps && rawNote.supps.length > 0 ? rawNote.supps.join(', ') : 'None'

        const date = rawNote ? rawNote.date : ''

        // Push [x, y, label, date]
        timepoints.push([m1Score, m2Score, supps, date])
      }
    }

    if (timepoints.length < 3) return echartsOptions

    // We cluster into 3 phases based on supplement regimes (simplification)
    const clusterCount = Math.min(3, timepoints.length - 1)

    const dataset = [
      {
        source: timepoints,
      },
      {
        transform: {
          type: 'ecStat:clustering',
          config: {
            clusterCount: clusterCount,
            outputType: 'single',
            outputClusterIndexDimension: 4,
            dimensions: [0, 1],
          },
        },
      },
    ]

    const pieces = []
    for (let i = 0; i < clusterCount; i++) {
      pieces.push({
        value: i,
        label: `Phase ${i + 1}`,
        color: CHART_PALETTE[i % CHART_PALETTE.length],
      })
    }

    const _useTags = xAxisTag !== '' && yAxisTag !== ''
    const formatTag = (tag: string) => tag.replace(/^\w-/, '')

    return {
      ...echartsOptions,
      dataset,
      visualMap: {
        type: 'piecewise',
        dimension: 4,
        pieces: pieces,
        orient: 'horizontal',
        bottom: 10,
        left: 'center',
        textStyle: { color: '#fff' },
      },
      xAxis: {
        ...echartsOptions.xAxis,
        scale: true,
        name: _useTags ? `${formatTag(xAxisTag)} Optimality (%)` : 'Group 1 Optimality (%)',
      },
      yAxis: {
        ...echartsOptions.yAxis,
        scale: true,
        name: _useTags ? `${formatTag(yAxisTag)} Optimality (%)` : 'Group 2 Optimality (%)',
      },
      series: [
        {
          type: 'scatter',
          datasetIndex: 1,
          symbolSize: 12,
          encode: {
            x: 0,
            y: 1,
            tooltip: [0, 1, 2, 3],
          },
        },
      ],
    }
  }, [data, noteValues, xAxisTag, yAxisTag, availableTags])

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-[#111111] border border-[#3a3a3a] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4 flex justify-between items-center"
                >
                  <span>Biological System Clustering</span>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    aria-label="Close dialog"
                    title="Close dialog"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="mt-2 text-gray-400 mb-4 text-sm">
                  This chart plots the Optimality Index (percentage of markers in the optimal range)
                  for two biological systems against each other. The statistical clustering
                  algorithm groups distinct historical phases based on these system balances.
                </div>

                {availableTags.length > 0 && (
                  <div className="flex gap-4 mb-6 bg-[#1a1a1a] p-3 rounded-lg border border-[#3a3a3a]">
                    <div className="flex flex-col gap-1 w-1/2">
                      <label
                        htmlFor="x-axis-group"
                        className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                      >
                        X-Axis Group
                      </label>
                      <select
                        id="x-axis-group"
                        value={xAxisTag}
                        onChange={(e) => setXAxisTag(e.target.value)}
                        className="bg-[#111111] text-white border border-[#3a3a3a] rounded p-2 text-sm focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {availableTags.map((t) => (
                          <option key={t} value={t}>
                            {t.replace(/^\w-/, '')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 w-1/2">
                      <label
                        htmlFor="y-axis-group"
                        className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                      >
                        Y-Axis Group
                      </label>
                      <select
                        id="y-axis-group"
                        value={yAxisTag}
                        onChange={(e) => setYAxisTag(e.target.value)}
                        className="bg-[#111111] text-white border border-[#3a3a3a] rounded p-2 text-sm focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {availableTags.map((t) => (
                          <option key={t} value={t}>
                            {t.replace(/^\w-/, '')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="w-full relative">
                  {!data || data.length === 0 ? (
                    <div className="h-[400px] flex items-center justify-center text-gray-500 italic">
                      Insufficient data to perform clustering.
                    </div>
                  ) : (
                    <ReactECharts
                      option={options}
                      style={echartsOptions.style}
                      notMerge={true}
                      theme="dark"
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
})

export default SystemClustering
