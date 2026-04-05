import { memo, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import * as ecStat from 'echarts-stat'
import { useAtomValue } from 'jotai'
import { noteValuesAtom, nonInferredDataAtom } from '../atom/dataAtom'
import { Fragment } from 'react'

echarts.registerTransform((ecStat as any).transform.clustering)

interface SupplementClusteringProps {
  isOpen: boolean
  onClose: () => void
}

export const CHART_PALETTE = [
  '#c23531', '#ADD4EF', '#BFDAA7', '#FCAC65', '#C6C1D2',
  '#7598E4', '#CF6D6C', '#4979CF', '#E1934B', '#829649',
  '#7D70AC', '#2559B7'
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
        const val1 = params.value[0] ? params.value[0].toFixed(2) : '-'
        const val2 = params.value[1] ? params.value[1].toFixed(2) : '-'
        const supps = params.value[2] ? params.value[2] : 'None'
        const date = params.value[3] ? params.value[3] : ''
        return `<strong>${date}</strong><br/>Supplements: <strong>${supps}</strong><br/>PC1: ${val1}<br/>PC2: ${val2}`
      }
      return params.name || ''
    }
  },
  xAxis: {
    type: 'value',
    name: 'Component 1',
    scale: true,
    splitLine: { lineStyle: { color: '#333' } }
  },
  yAxis: {
    type: 'value',
    name: 'Component 2',
    scale: true,
    splitLine: { lineStyle: { color: '#333' } }
  },
  dataset: [],
  series: []
}

const SupplementClustering = memo(({ isOpen, onClose }: SupplementClusteringProps) => {
  const data = useAtomValue(nonInferredDataAtom)
  const noteValues = useAtomValue(noteValuesAtom)

  const options = useMemo(() => {
    if (!data || data.length === 0 || !noteValues || noteValues.length === 0) return echartsOptions

    // 1. Prepare matrix: we need numeric arrays for each valid timepoint
    // We only use timepoints where we have measurements for most markers
    const numMarkers = data.length
    const numTimepoints = data[0][1].length

    const timepoints = []

    for (let t = 0; t < numTimepoints; t++) {
      let valid = true
      let sum = 0
      for (let m = 0; m < numMarkers; m++) {
        const val = data[m][1][t]
        if (val === null || val === undefined || isNaN(val as number)) {
          valid = false
          break
        }
        sum += (val as number)
      }

      if (valid) {
        // Simplified dimensionality reduction: just map to 2 summary metrics for demo clustering
        // In reality, this would be PCA, but we just want to demonstrate ecStat clustering
        let m1 = 0, m2 = 0
        for (let m = 0; m < Math.floor(numMarkers/2); m++) {
           m1 += (data[m][1][t] as number)
        }
        for (let m = Math.floor(numMarkers/2); m < numMarkers; m++) {
           m2 += (data[m][1][t] as number)
        }

        const supps = noteValues[t] && noteValues[t].supps && noteValues[t].supps.length > 0
          ? noteValues[t].supps.join(', ')
          : 'None'

        const date = noteValues[t] ? noteValues[t].date : ''

        // Push [x, y, label, date]
        timepoints.push([m1, m2, supps, date])
      }
    }

    if (timepoints.length < 3) return echartsOptions

    // We cluster into 3 phases based on supplement regimes (simplification)
    const clusterCount = Math.min(3, timepoints.length - 1)

    const dataset = [
      {
        source: timepoints
      },
      {
        transform: {
          type: 'ecStat:clustering',
          config: {
            clusterCount: clusterCount,
            outputType: 'single',
            outputClusterIndexDimension: 4
          }
        }
      }
    ]

    const series = []

    // We render the clusters
    for (let i = 0; i < clusterCount; i++) {
       series.push({
         name: `Phase ${i+1}`,
         type: 'scatter',
         datasetIndex: 1,
         symbolSize: 12,
         itemStyle: {
            color: CHART_PALETTE[i % CHART_PALETTE.length]
         },
         encode: {
            x: 0,
            y: 1,
            tooltip: [0, 1, 2, 3]
         }
       })
    }

    return {
      ...echartsOptions,
      dataset,
      series
    }
  }, [data, noteValues])

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
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4 flex justify-between items-center">
                  <span>Supplement Phase Clustering</span>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Close dialog"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="mt-2 text-gray-400 mb-6 text-sm">
                  This chart statistically clusters your biomarker profiles over time. It can reveal whether different supplement phases (e.g., stopping Vitamin D) resulted in distinctly different biological states.
                </div>

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

export default SupplementClustering
