import React from 'react'
import './index.css'
import Nav from './layout/Nav'
import Table from './layout/Table'

const DarkVeil = React.lazy(() => import('./layout/DarkVeil'))
const PValue = React.lazy(() => import('./layout/PValue'))
const Correlation = React.lazy(() => import('./layout/Correlation'))
const SystemClustering = React.lazy(() => import('./layout/SystemClustering'))
import { useAtomValue, useAtom } from 'jotai'

const ScatterChart = React.lazy(() => import('./layout/ScatterChart'))
const RadarChart = React.lazy(() => import('./layout/RadarChart'))
import {
  getBioMarkersAtom,
  filterTextAtom,
  tagAtom,
  aiKeyAtom,
  aiModelAtom,
  gistTokenAtom,
} from './atom/dataAtom'
import { BioMarker } from './types/biomarker'
import { PasswordInput } from './layout/PasswordInput'
import { Spinner } from './layout/Spinner'

export default function App() {
  const [isClusteringOpen, setIsClusteringOpen] = React.useState(false)
  const data = useAtomValue(getBioMarkersAtom)
  const [selected, setSelect] = React.useState<string[]>([])
  const [filterText, setFilterText] = useAtom(filterTextAtom)
  const [searchText, setSearchText] = React.useState(filterText)
  const [filterTag, setFilterTag] = useAtom(tagAtom)
  const [aiKey, setAiKey] = useAtom(aiKeyAtom)
  const [aiModel, setAiModel] = useAtom(aiModelAtom)
  const [gistToken, setGistToken] = useAtom(gistTokenAtom)
  const [showOrigColumns, setShowOrigColumns] = React.useState<boolean>(false)
  const [showRecords, setShowRecords] = React.useState<number>(5)
  const [chartKeys, setChartKeys] = React.useState<string[] | null>(null)
  const [chartType, setChartType] = React.useState<string>('scatter')
  const [comparedSourceTarget, setSourceTarget] = React.useState<BioMarker[] | null>(null)
  const [corrlationKey, setCorrelationKey] = React.useState<string | null>(null)
  const [showAiKey, setShowAiKey] = React.useState(false)
  const [showGistToken, setShowGistToken] = React.useState(false)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      React.startTransition(() => {
        setFilterText(searchText)
      })
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchText, setFilterText])

  const onTextChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value),
    [],
  )

  const onOriginValueToggle = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setShowOrigColumns(e.target.checked),
    [],
  )

  const onShowRecordsChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setShowRecords(+e.target.value),
    [],
  )

  const onAiKeyChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setAiKey(e.target.value),
    [],
  )

  const onAiModelChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setAiModel(e.target.value),
    [],
  )

  const onGistTokenChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setGistToken(e.target.value),
    [],
  )

  const onFilterByTag = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      React.startTransition(() => {
        setFilterTag((e.target as HTMLElement).dataset.tag as string)
        setSearchText('')
        setFilterText('')
        setCorrelationKey(null)
        setSelect([])
        setSourceTarget(null)
      })
      setShowOrigColumns(false)
    },
    [setFilterTag, setFilterText, setCorrelationKey, setSelect, setSourceTarget],
  )

  // Optimization: use useRef to make onSelect stable across renders
  // This prevents the Table component from re-rendering just because onSelect was recreated
  // when `selected` changed.
  const selectedRef = React.useRef(selected)
  React.useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  const onSelect = React.useCallback((name: string) => {
    const values = selectedRef.current
    const index = values.indexOf(name)
    let newValues
    if (index === -1) {
      newValues = [...values, name]
    } else {
      newValues = values.toSpliced(index, 1)
    }

    setSelect(newValues)

    setChartKeys((keys) => {
      if (newValues.length === 0) {
        return null
      }
      if (keys) {
        return newValues
      }
      return keys
    })
  }, [])

  const onVisualize = React.useCallback(() => {
    setChartKeys((keys) => (!keys ? selected : null))
  }, [selected])

  const onPValue = React.useCallback(() => {
    // Optimization: Use a Set for O(1) lookups instead of O(N) array.includes inside the filter loop.
    // This reduces complexity from O(M * N) to O(M + N).
    const selectedSet = new Set(selected)
    let sourceTarget: (BioMarker | undefined)[] = data.filter(([name]) => selectedSet.has(name))

    // Optimization: Use a Map for O(1) lookups instead of O(N) array.find inside the map loop.
    // This reduces complexity from O(K * N) to O(K + N).
    const sourceTargetMap = new Map(sourceTarget.map((item) => [item![0], item]))
    sourceTarget = selected.map((name) => sourceTargetMap.get(name))

    if (sourceTarget.some((i) => !i)) {
      return
    }
    setSourceTarget((v) => {
      if (v && sourceTarget[0] === v[0] && sourceTarget[1] === v[1]) {
        return null
      }
      return sourceTarget as BioMarker[]
    })
  }, [selected, data])

  const onCorrelation = React.useCallback((name: string) => {
    setCorrelationKey((v) => {
      if (name === v) {
        return null
      }
      return name
    })
  }, [])

  const onChartTypeChange = React.useCallback((type: string) => {
    setChartType(type)
  }, [])

  const onClearSelection = React.useCallback(() => {
    setSelect([])
    setChartKeys(null)
    setSourceTarget(null)
    setCorrelationKey(null)
  }, [])

  const onClearFilters = React.useCallback(() => {
    setSearchText('')
    React.startTransition(() => {
      setFilterTag(null)
      setFilterText('')
    })
  }, [setFilterTag, setFilterText])

  // Optimization: Memoize props passed to components to prevent unnecessary re-renders.
  // navProps changes on every keystroke (due to searchText), so Nav will re-render, which is correct.
  const navProps = React.useMemo(
    () => ({
      selected,
      onSelect,
      chartType,
      onChartTypeChange,
      onClearSelection,
      filterText: searchText,
      filterTag,
      showOrigColumns,
      showRecords,
      onShowRecordsChange,
      onTextChange,
      onFilterByTag,
      onOriginValueToggle,
      onVisualize,
      onPValue,
      onOpenClustering: () => setIsClusteringOpen(true),
    }),
    [
      selected,
      onSelect,
      chartType,
      onChartTypeChange,
      onClearSelection,
      searchText,
      filterTag,
      showOrigColumns,
      showRecords,
      onShowRecordsChange,
      onTextChange,
      onFilterByTag,
      onOriginValueToggle,
      onVisualize,
      onPValue,
      setIsClusteringOpen,
    ],
  )

  // Optimization: Pre-filter radar chart data in a memoized hook with a single-pass loop.
  // Previously, inline `data.filter()` created a new array reference on every keystroke
  // when `searchText` changed, invalidating the memoized RadarChart and causing severe
  // lag during typing.
  const radarChartData = React.useMemo(() => {
    if (!filterTag || !data) return []
    const result: typeof data = []
    for (let i = 0; i < data.length; i++) {
      const entry = data[i]
      if (entry[3]?.tag?.includes(filterTag)) {
        result.push(entry)
      }
    }
    return result
  }, [data, filterTag])

  // Optimization: tableProps does NOT include searchText. It only includes state relevant to the table.
  // This prevents the heavy Table component from re-rendering on every keystroke in the search input,
  // since Table relies on the debounced filterTextAtom, not the immediate searchText.
  const tableProps = React.useMemo(
    () => ({
      showOrigColumns,
      selected,
      onSelect,
      showRecords,
      onClearFilters,
      onCorrelation,
    }),
    [showOrigColumns, selected, onSelect, showRecords, onClearFilters, onCorrelation],
  )

  // Optimization: Memoize onClose handlers to ensure referential stability for React.memo components
  const onPValueClose = React.useCallback(() => setSourceTarget(null), [])
  const onCorrelationClose = React.useCallback(() => setCorrelationKey(null), [])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-dark-bg"
      >
        Skip to content
      </a>
      <React.Suspense fallback={null}>
        <div className="fixed inset-0 -z-10">
          <DarkVeil />
        </div>
      </React.Suspense>
      <Nav {...navProps} />
      <React.Suspense fallback={null}>
        <PValue comparedSourceTarget={comparedSourceTarget} onClose={onPValueClose} />
        <Correlation target={corrlationKey} onClose={onCorrelationClose} />
        <SystemClustering isOpen={isClusteringOpen} onClose={() => setIsClusteringOpen(false)} />
      </React.Suspense>
      <main id="main-content" tabIndex={-1}>
        <React.Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-12 gap-3 text-gray-400">
              <Spinner />
              <span role="status" aria-live="polite">
                Loading chart...
              </span>
            </div>
          }
        >
          {filterTag && (!chartKeys || chartKeys.length === 0) && (
            <RadarChart data={radarChartData} tag={filterTag} />
          )}
          {chartKeys && chartKeys.length > 0 && chartType === 'scatter' && (
            <ScatterChart keys={chartKeys} />
          )}
        </React.Suspense>
        <Table {...tableProps} />
        <div className="flex flex-wrap justify-center gap-4 mt-4 pb-8">
          <div className="flex flex-col gap-1">
            <label htmlFor="ai-model" className="text-xs text-gray-400 font-medium ml-1">
              AI Model
            </label>
            <select
              id="ai-model"
              className="px-3 py-2 bg-dark-bg text-dark-text border border-gray-600 rounded focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
              value={aiModel}
              onChange={onAiModelChange}
            >
              <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="gemini-key" className="text-xs text-gray-400 font-medium ml-1">
              Gemini API Key
            </label>
            <PasswordInput
              name="key"
              value={aiKey || ''}
              onChange={onAiKeyChange}
              id="gemini-key"
              placeholder="Gemini key"
              autoComplete="gemini-key"
              show={showAiKey}
              setShow={setShowAiKey}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="gist-token" className="text-xs text-gray-400 font-medium ml-1">
              Gist Token
            </label>
            <PasswordInput
              name="gist_token"
              value={gistToken || ''}
              onChange={onGistTokenChange}
              id="gist-token"
              placeholder="Gist token"
              autoComplete="gist-token"
              show={showGistToken}
              setShow={setShowGistToken}
            />
          </div>
        </div>
      </main>
    </>
  )
}
