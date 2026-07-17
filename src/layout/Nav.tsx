import React, { Fragment } from 'react'
import cn from 'classnames'
import { Dialog, Transition, Popover } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  ChevronDownIcon,
  BeakerIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { tags } from '../processors'
import { askBioMarkers } from '../service/askAI'
import { createGist } from '../service/gist'
import { useAtom, useAtomValue } from 'jotai'
import {
  visibleDataAtom,
  dataAtom,
  aiKeyAtom,
  gistTokenAtom,
  aiModelAtom,
  rankedDataMapAtom,
  nonInferredDataAtom,
  noteValuesAtom,
} from '../atom/dataAtom'
import { calculateSpearmanRanked } from '../processors/stats'
import { averageCountAtom } from '../atom/averageValueAtom'
import Markdown from 'react-markdown'
import { Spinner } from './Spinner'
import { NavProps } from './Nav.types'

interface NoteValue {
  date: string;
  supps: string[];
  items: string[];
}

// Optimization: Lazy load the GistViewer modal to reduce the initial JavaScript bundle size.
// This modal is only needed when a user explicitly clicks "View History", so code-splitting it
// significantly improves the initial page load speed without sacrificing readability.
const GistViewer = React.lazy(() => import('./GistViewer'))

export default React.memo<NavProps>(
  ({
    selected,
    onSelect,
    chartType: _chartType,
    onChartTypeChange: _onChartTypeChange,
    onClearSelection,
    filterText,
    filterTag,
    showRecords,
    onShowRecordsChange,
    onTextChange,
    onFilterByTag,
    onVisualize,
    onPValue,
    onSupplementCorrelation,
    onOpenClustering,
    isMatrixViewOpen,
    onToggleMatrixView,
    isNetworkViewOpen,
    onToggleNetworkView,
  }) => {
    const [averageCount, setAverageCount] = useAtom(averageCountAtom)
    const key = useAtomValue(aiKeyAtom)
    const model = useAtomValue(aiModelAtom)
    const gistToken = useAtomValue(gistTokenAtom)
    const data = useAtomValue(visibleDataAtom)
    const fullData = useAtomValue(dataAtom)
    const nonInferredData = useAtomValue(nonInferredDataAtom)
    const noteValues = useAtomValue(noteValuesAtom) as any[]
    const rankedDataMap = useAtomValue(rankedDataMapAtom)

    // Optimization: Pre-calculate unique supplements for the dropdown
    const uniqueSupplements = React.useMemo(() => {
      const supps = new Set<string>()
      for (let i = 0; i < noteValues.length; i++) {
        const note = noteValues[i] as NoteValue
        if (note && note.supps) {
          for (let j = 0; j < note.supps.length; j++) {
            supps.add(note.supps[j])
          }
        }
      }
      return Array.from(supps).sort()
    }, [noteValues])

    const [show, setShow] = React.useState(false)
    const [isAsking, setIsAsking] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isCopied, setIsCopied] = React.useState(false)
    const searchInputRef = React.useRef<HTMLInputElement>(null)

    // Submenu state for Analyze Popover
    const [activeSubMenu, setActiveSubMenu] = React.useState<'main' | 'supplements'>('main')

    React.useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10)
      }
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === '/' &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey &&
          !['INPUT', 'TEXTAREA', 'SELECT'].includes(
            (document.activeElement as HTMLElement)?.tagName,
          )
        ) {
          e.preventDefault()
          searchInputRef.current?.focus()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const onAskAI = React.useCallback(async () => {
      if (selected.length === 0) {
        return
      }
      setIsAsking(true)

      try {
        const selectedSet = new Set(selected)
        const pairs: string[] = []
        const prevPairs: string[] = []
        for (let i = 0; i < data.length; i++) {
          const entry = data[i]
          const key = entry[0]
          if (selectedSet.has(key)) {
            const values = entry[1]
            const unit = entry[2] || ''
            pairs.push(`${key} ${values[values.length - 1]} ${unit}`)
            if (values.length > 1) {
              prevPairs.push(`${key} ${values[values.length - 2]} ${unit}`)
            }
          }
        }
        const relatedContext = (() => {
          if (!fullData || fullData.length === 0) return undefined
          const selectedEntries: typeof fullData = []
          for (let i = 0; i < fullData.length; i++) {
            if (selectedSet.has(fullData[i][0])) {
              selectedEntries.push(fullData[i])
            }
          }
          const candidates: typeof nonInferredData = []
          for (let i = 0; i < nonInferredData.length; i++) {
            const d = nonInferredData[i]
            if (
              !selectedSet.has(d[0]) &&
              !d[0].startsWith('HOMA') &&
              !d[0].startsWith('eGFR') &&
              !d[0].startsWith('SL ')
            ) {
              candidates.push(d)
            }
          }
          const related = new Map<string, string>()
          const options = { alpha: 0.05, alternative: 'two-sided' } as const

          for (const source of selectedEntries) {
            const sourceRanks = rankedDataMap.get(source[0])
            if (!sourceRanks) continue
            for (const target of candidates) {
              if (related.has(target[0])) continue
              const targetRanks = rankedDataMap.get(target[0])
              if (!targetRanks) continue
              const res = calculateSpearmanRanked(sourceRanks, targetRanks, options)
              if (res.pValue <= 0.05 && Math.abs(res.statistic) >= 0.4) {
                const val = target[1][target[1].length - 1]
                if (!val) continue
                const unit = target[2] || ''
                related.set(target[0], `- ${target[0]}: ${val} ${unit} (Correlation: ${res.statistic.toFixed(2)}, P-Value: ${res.pValue.toFixed(4)})`)
              }
            }
          }
          if (related.size === 0) return undefined
          return 'Related Biomarkers (Significant Correlations):\n' + Array.from(related.values()).join('\n')
        })()

        const text = await askBioMarkers(pairs, key, model, filterTag, prevPairs, relatedContext)
        setCanvasText(text)
      } catch (err) {
        console.error(err)
        alert(err)
      } finally {
        setIsAsking(false)
      }
    }, [selected, data, filterTag, key, model, fullData, nonInferredData, rankedDataMap])

    const [canvasText, setCanvasText] = React.useState<string | null>(null)
    const [gistUrl, setGistUrl] = React.useState<string | null>(null)
    const [gistError, setGistError] = React.useState<string | null>(null)
    const [isGistLoading, setIsGistLoading] = React.useState(false)
    const [isGistViewerOpen, setIsGistViewerOpen] = React.useState(false)
    const [hasGistViewerMounted, setHasGistViewerMounted] = React.useState(false)

    const handleClose = React.useCallback(() => {
      setCanvasText(null)
      setGistUrl(null)
      setGistError(null)
      setIsGistLoading(false)
    }, [])

    const onAverageCount = React.useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => setAverageCount(e.target.value),
      [setAverageCount],
    )

    return (
      <>
        <header
          className={cn(
            'sticky top-0 left-0 z-20 w-full transition-colors duration-300 ease-in-out border-b border-gray-800 shadow-lg',
            {
              'bg-dark-accent/90 backdrop-blur-md': !isScrolled,
              'bg-dark-accent-solid': isScrolled,
            },
          )}
        >
          {/* Row 1: Identity + Global Controls */}
          <div className="flex items-center justify-between px-6 py-2 h-14 gap-4">
            <div className="flex items-center gap-8 flex-1 min-w-0">
              {/* Branding - Hidden below md breakpoint to save space */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <BeakerIcon className="h-6 w-6 text-accent" />
                <span className="text-lg font-bold tracking-tight text-white">MyHealth</span>
              </div>

              {/* Category Filters - Moved to Row 1 on mobile/tablet (< md) */}
              <div className="flex md:hidden items-center gap-1 overflow-x-auto no-scrollbar mask-fade-right flex-1 min-w-0">
                <button
                  type="button"
                  data-tag=""
                  onClick={onFilterByTag}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                    filterTag === null
                      ? 'bg-accent text-white shadow-sm shadow-accent/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50',
                  )}
                >
                  All
                </button>
                {tags.map((tag: string) => {
                  const isSelectedTag = filterTag == tag
                  return (
                    <button
                      key={tag}
                      type="button"
                      data-tag={tag}
                      onClick={onFilterByTag}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                        isSelectedTag
                          ? 'bg-accent text-white shadow-sm shadow-accent/20'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50',
                      )}
                    >
                      {tag.slice(2)}
                    </button>
                  )
                })}
                {filterTag !== null && (
                  <button
                    type="button"
                    data-tag=""
                    onClick={onFilterByTag}
                    className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-accent transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="max-w-md w-full hidden md:block">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent transition-colors">
                    <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <input
                    id="search-biomarkers"
                    ref={searchInputRef}
                    type="search"
                    value={filterText}
                    onChange={onTextChange}
                    placeholder="Search biomarkers..."
                    className="block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-1.5 pl-9 pr-12 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <kbd className="hidden sm:inline-flex items-center px-1.5 font-sans text-[10px] font-medium text-gray-500 border border-gray-700 rounded bg-gray-800">
                      /
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              {/* View Controls */}
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <CalendarIcon className="h-4 w-4" />
                  <select
                    id="show-records"
                    className="bg-transparent text-xs font-medium focus:outline-none focus:text-white cursor-pointer hover:text-gray-200 transition-colors"
                    value={showRecords.toString()}
                    onChange={onShowRecordsChange}
                  >
                    <option value="0" className="bg-gray-900">All records</option>
                    <option value="3" className="bg-gray-900">Last 3</option>
                    <option value="5" className="bg-gray-900">Last 5</option>
                    <option value="10" className="bg-gray-900">Last 10</option>
                    <option value="15" className="bg-gray-900">Last 15</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-gray-400 border-l border-gray-700 pl-4">
                  <ChartBarIcon className="h-4 w-4" />
                  <select
                    id="average-count"
                    className="bg-transparent text-xs font-medium focus:outline-none focus:text-white cursor-pointer hover:text-gray-200 transition-colors"
                    value={averageCount.toString()}
                    onChange={onAverageCount}
                  >
                    <option value="" className="bg-gray-900">No average</option>
                    <option value="3" className="bg-gray-900">Avg of 3</option>
                    <option value="5" className="bg-gray-900">Avg of 5</option>
                    <option value="10" className="bg-gray-900">Avg of 10</option>
                    <option value="15" className="bg-gray-900">Avg of 15</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsGistViewerOpen(true)
                    setHasGistViewerMounted(true)
                  }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-medium border-l border-gray-700 pl-4 transition-colors"
                >
                  <ClockIcon className="h-4 w-4" />
                  History
                </button>
              </div>

              <button
                type="button"
                className="lg:hidden p-2 text-gray-400 hover:text-white focus:outline-none rounded-lg hover:bg-gray-800"
                onClick={() => setShow(true)}
                aria-label="Open menu"
              >
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Row 2: Context (Filters + Actions) */}
          <div className="flex items-center justify-between px-6 py-2 border-t border-gray-800 h-12 bg-black/20 gap-4">
            {/* Category Filters - Displayed in Row 2 only on desktop (>= md) */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar mask-fade-right">
              <button
                type="button"
                data-tag=""
                onClick={onFilterByTag}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                  filterTag === null
                    ? 'bg-accent text-white shadow-sm shadow-accent/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50',
                )}
              >
                All
              </button>
              {tags.map((tag: string) => {
                const isSelectedTag = filterTag == tag
                return (
                  <button
                    key={tag}
                    type="button"
                    data-tag={tag}
                    onClick={onFilterByTag}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                      isSelectedTag
                        ? 'bg-accent text-white shadow-sm shadow-accent/20'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50',
                    )}
                  >
                    {tag.slice(2)}
                  </button>
                )
              })}
              {filterTag !== null && (
                <button
                  type="button"
                  data-tag=""
                  onClick={onFilterByTag}
                  className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-accent transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Actions - Anchored to the right using ml-auto */}
            <div className="flex items-center gap-3 ml-auto shrink-0">
              {selected.length > 0 && (
                <div className="flex items-center gap-2 pr-3 border-r border-gray-800 mr-1">
                  <div className="flex gap-1.5">
                    {selected.slice(0, 3).map((item) => (
                      <div
                        key={item}
                        className="h-5 px-2 flex items-center bg-gray-800 border border-gray-700 rounded-md text-[10px] text-gray-400 animate-fade-in gap-1"
                        title={item}
                      >
                        {item.length > 8 ? item.slice(0, 8) + '...' : item}
                        <button
                          type="button"
                          onClick={() => onSelect(item)}
                          className="ml-1 text-gray-500 hover:text-accent transition-colors"
                        >
                          <XMarkIcon className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                    {selected.length > 3 && (
                      <div className="h-5 px-1 flex items-center bg-gray-900 border border-gray-800 rounded-md text-[10px] text-gray-500">
                        +{selected.length - 3}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClearSelection}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    title="Clear Selection"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Analyze Popover with 2-Step Submenu Flow */}
              <Popover className="relative">
                {({ open, close }) => {
                  // Reset submenu back to main when popover closes
                  if (!open && activeSubMenu !== 'main') {
                    // Execute on next tick to avoid React render updates warning
                    setTimeout(() => setActiveSubMenu('main'), 100);
                  }
                  return (
                    <>
                      <Popover.Button
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                          'bg-accent text-white hover:bg-accent/90 shadow-sm shadow-accent/20',
                          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
                        )}
                      >
                        Analyze
                        <ChevronDownIcon className={cn('h-3.5 w-3.5 transition-transform', open ? 'rotate-180' : '')} />
                      </Popover.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Popover.Panel className="absolute right-0 mt-2 w-64 origin-top-right bg-gray-900 border border-gray-800 rounded-xl shadow-2xl focus:outline-none z-30 p-1.5">
                          {activeSubMenu === 'main' ? (
                            <div className="space-y-1">
                              <div className="px-3 py-2 mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800/30">
                                Selected Markers ({selected.length})
                              </div>

                              <button
                                onClick={() => { onVisualize(); close(); }}
                                disabled={selected.length === 0}
                                className={cn(
                                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left',
                                  'text-gray-300 hover:bg-gray-800/80 hover:text-white',
                                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300',
                                )}
                              >
                                <ChartBarIcon className="h-4 w-4 text-accent" />
                                Visualize Selection
                              </button>

                              <button
                                onClick={() => { onPValue(); close(); }}
                                disabled={selected.length !== 2}
                                className={cn(
                                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left',
                                  'text-gray-300 hover:bg-gray-800/80 hover:text-white',
                                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300',
                                )}
                              >
                                <BeakerIcon className="h-4 w-4 text-accent" />
                                Calculate P-Value
                              </button>

                              <div className="px-3 py-2 mt-2 mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-t border-b border-gray-800/30">
                                Global Analysis
                              </div>

                              <button
                                onClick={() => { onToggleMatrixView(); close(); }}
                                disabled={filterTag == null}
                                className={cn(
                                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left',
                                  'text-gray-300 hover:bg-gray-800/80 hover:text-white',
                                  isMatrixViewOpen ? 'text-accent font-semibold' : '',
                                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300',
                                )}
                              >
                                <div className={cn('h-1.5 w-1.5 rounded-full bg-accent transition-all', isMatrixViewOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} />
                                Correlation Matrix
                              </button>

                              <button
                                onClick={() => { onToggleNetworkView(); close(); }}
                                className={cn(
                                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left',
                                  'text-gray-300 hover:bg-gray-800/80 hover:text-white',
                                  isNetworkViewOpen ? 'text-accent font-semibold' : '',
                                )}
                              >
                                <div className={cn('h-1.5 w-1.5 rounded-full bg-accent transition-all', isNetworkViewOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} />
                                Chord Diagram
                              </button>

                              {onOpenClustering && (
                                <button
                                  onClick={() => { onOpenClustering(); close(); }}
                                  className={cn(
                                    'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left',
                                    'text-gray-300 hover:bg-gray-800/80 hover:text-white',
                                  )}
                                >
                                  <SparklesIcon className="h-4 w-4 text-purple-400" />
                                  Detect Phases
                                </button>
                              )}

                              <div className="h-px bg-gray-800/40 my-1 mx-2" />

                              <button
                                onClick={() => setActiveSubMenu('supplements')}
                                className={cn(
                                  'flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left',
                                  'text-gray-300 hover:bg-gray-800/80 hover:text-white',
                                )}
                              >
                                <div className="flex items-center gap-2.5">
                                  <SparklesIcon className="h-4 w-4 text-purple-400" />
                                  Correlate supplement...
                                </div>
                                <ChevronDownIcon className="h-3 w-3 -rotate-90" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <button
                                onClick={() => setActiveSubMenu('main')}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
                              >
                                <ArrowLeftIcon className="h-3 w-3" />
                                Back
                              </button>

                              <div className="px-3 py-1 mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800/30">
                                Select Supplement
                              </div>

                              <div className="max-h-56 overflow-y-auto no-scrollbar space-y-0.5">
                                {uniqueSupplements.map((supp) => (
                                  <button
                                    key={supp}
                                    onClick={() => {
                                      onSupplementCorrelation(supp);
                                      close();
                                    }}
                                    className="flex w-full items-center px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-left"
                                  >
                                    {supp}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </Popover.Panel>
                      </Transition>
                    </>
                  )
                }}
              </Popover>

              {/* Ask AI - Text label hidden below md to save space */}
              <button
                type="button"
                onClick={onAskAI}
                disabled={isAsking || selected.length === 0}
                className={cn(
                  'flex items-center justify-center gap-1.5 p-1.5 md:px-4 md:py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0',
                  'border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                )}
                title="Ask AI about selected biomarkers"
              >
                {isAsking ? <Spinner /> : <SparklesIcon className="h-3.5 w-3.5 text-accent" />}
                <span className="hidden md:inline">Ask AI</span>
              </button>
            </div>
          </div>
        </header>

        <React.Suspense
          fallback={
            <div
              className="fixed bottom-4 right-4 z-50 flex items-center justify-center px-4 py-3 bg-gray-800 text-gray-300 rounded-md shadow-xl border border-gray-700 gap-3 animate-pulse"
              aria-busy="true"
              role="status"
              aria-live="polite"
            >
              <Spinner />
              <span className="text-sm font-medium">Loading module...</span>
            </div>
          }
        >
          {hasGistViewerMounted && (
            <GistViewer isOpen={isGistViewerOpen} onClose={() => setIsGistViewerOpen(false)} />
          )}
        </React.Suspense>

        <Transition appear show={!!canvasText} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={handleClose}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-end p-0 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="flex flex-col w-full max-w-3xl transform overflow-hidden bg-[#222222] text-dark-text p-6 text-left align-middle shadow-xl transition-all h-screen ml-auto border-l border-gray-700">
                    <Dialog.Title
                      as="div"
                      className="flex justify-between items-center text-lg font-medium leading-6 mb-4"
                    >
                      <span>Biomarker</span>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                        aria-label="Close dialog"
                        title="Close dialog"
                      >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </Dialog.Title>
                    <div className="mt-2 prose prose-invert max-w-none overflow-y-auto">
                      <Markdown>{canvasText}</Markdown>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(canvasText || '')
                          setIsCopied(true)
                          setTimeout(() => setIsCopied(false), 2000)
                        }}
                        className={`px-4 py-2 border rounded flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent min-w-[160px] ${
                          isCopied
                            ? 'border-green-600 text-green-400 bg-green-900/20'
                            : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                        title="Copy analysis to clipboard"
                        aria-live="polite"
                      >
                        {isCopied ? (
                          <>
                            <CheckIcon className="h-5 w-5" aria-hidden="true" /> Copied!
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-5 w-5" aria-hidden="true" /> Copy
                            Analysis
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        disabled={isGistLoading}
                        aria-busy={isGistLoading}
                        title="Save analysis to Gist"
                        aria-live="polite"
                        onClick={async () => {
                          setIsGistLoading(true)
                          setGistError(null)
                          setGistUrl(null)
                          if (!gistToken) {
                            setGistError('Please provide a Gist token.')
                            setIsGistLoading(false)
                            return
                          }
                          try {
                            const url = await createGist(canvasText!, gistToken, selected.join('_'))
                            setGistUrl(url)
                          } catch (err: any) {
                            setGistError(err.message)
                          } finally {
                            setIsGistLoading(false)
                          }
                        }}
                      >
                        {isGistLoading ? (
                          <>
                            <Spinner /> Saving...
                          </>
                        ) : (
                          'Save to Gist'
                        )}
                      </button>
                      {gistUrl && (
                        <div className="mt-2">
                          <a
                            href={gistUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            View Gist
                          </a>
                        </div>
                      )}
                      {gistError && <div className="mt-2 text-red-500">{gistError}</div>}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <Transition.Root show={show} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setShow}>
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                      <div className="flex h-full flex-col overflow-y-scroll bg-dark-bg shadow-2xl border-l border-gray-800 no-scrollbar">
                        <div className="px-6 py-6 border-b border-gray-800">
                          <div className="flex items-center justify-between">
                            <Dialog.Title className="text-lg font-bold text-white flex items-center gap-2">
                              <BeakerIcon className="h-5 w-5 text-accent" />
                              MyHealth
                            </Dialog.Title>
                            <button
                              type="button"
                              className="rounded-md text-gray-400 hover:text-white focus:outline-none"
                              onClick={() => setShow(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>

                          <div className="mt-6">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
                              </div>
                              <input
                                type="search"
                                value={filterText}
                                onChange={onTextChange}
                                placeholder="Search biomarkers..."
                                className="block w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 px-6 py-8 space-y-10">
                          {/* Filters Section */}
                          <section>
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                data-tag=""
                                onClick={(e) => { onFilterByTag(e); setShow(false); }}
                                className={cn(
                                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                  filterTag === null
                                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800',
                                )}
                              >
                                All
                              </button>
                              {tags.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  data-tag={tag}
                                  onClick={(e) => { onFilterByTag(e); setShow(false); }}
                                  className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                    filterTag === tag
                                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                      : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800',
                                  )}
                                >
                                  {tag.slice(2)}
                                </button>
                              ))}
                            </div>
                          </section>

                          {/* Analyze Section */}
                          <section>
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Analyze</h3>
                            <div className="grid grid-cols-1 gap-3">
                              <button
                                onClick={() => { onVisualize(); setShow(false); }}
                                disabled={selected.length === 0}
                                className="flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-30"
                              >
                                <ChartBarIcon className="h-5 w-5 text-accent" />
                                Visualize Selection ({selected.length})
                              </button>
                              <button
                                onClick={() => { onToggleMatrixView(); setShow(false); }}
                                disabled={filterTag == null}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-medium transition-colors",
                                  isMatrixViewOpen ? "text-accent border-accent/30 bg-accent/5" : "text-gray-300"
                                )}
                              >
                                <div className={cn("h-2 w-2 rounded-full", isMatrixViewOpen ? "bg-accent" : "bg-gray-700")} />
                                Correlation Matrix
                              </button>
                              <button
                                onClick={() => { onToggleNetworkView(); setShow(false); }}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-medium transition-colors",
                                  isNetworkViewOpen ? "text-accent border-accent/30 bg-accent/5" : "text-gray-300"
                                )}
                              >
                                <div className={cn("h-2 w-2 rounded-full", isNetworkViewOpen ? "bg-accent" : "bg-gray-700")} />
                                Chord Diagram
                              </button>
                              {onOpenClustering && (
                                <button
                                  onClick={() => { onOpenClustering(); setShow(false); }}
                                  className="flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-medium text-gray-300"
                                >
                                  <SparklesIcon className="h-5 w-5 text-purple-400" />
                                  Detect Phases
                                </button>
                              )}
                              <button
                                onClick={() => { onAskAI(); setShow(false); }}
                                disabled={isAsking || selected.length === 0}
                                className="flex items-center gap-3 px-4 py-3 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 disabled:opacity-50"
                              >
                                <SparklesIcon className="h-5 w-5" />
                                {isAsking ? 'Asking AI...' : 'Ask AI'}
                              </button>
                            </div>
                          </section>

                          {/* View Section */}
                          <section>
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">View Settings</h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl">
                                <div className="flex items-center gap-3 text-gray-400">
                                  <CalendarIcon className="h-5 w-5" />
                                  <span className="text-sm font-medium">Record range</span>
                                </div>
                                <select
                                  className="bg-transparent text-sm font-bold text-white focus:outline-none"
                                  value={showRecords.toString()}
                                  onChange={onShowRecordsChange}
                                >
                                  <option value="0" className="bg-gray-900">All</option>
                                  <option value="3" className="bg-gray-900">Last 3</option>
                                  <option value="5" className="bg-gray-900">Last 5</option>
                                  <option value="10" className="bg-gray-900">Last 10</option>
                                  <option value="15" className="bg-gray-900">Last 15</option>
                                </select>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl">
                                <div className="flex items-center gap-3 text-gray-400">
                                  <ChartBarIcon className="h-5 w-5" />
                                  <span className="text-sm font-medium">Average mode</span>
                                </div>
                                <select
                                  className="bg-transparent text-sm font-bold text-white focus:outline-none"
                                  value={averageCount.toString()}
                                  onChange={onAverageCount}
                                >
                                  <option value="" className="bg-gray-900">None</option>
                                  <option value="3" className="bg-gray-900">Avg of 3</option>
                                  <option value="5" className="bg-gray-900">Avg of 5</option>
                                  <option value="10" className="bg-gray-900">Avg of 10</option>
                                  <option value="15" className="bg-gray-900">Avg of 15</option>
                                </select>
                              </div>
                              <button
                                onClick={() => {
                                  setIsGistViewerOpen(true);
                                  setHasGistViewerMounted(true);
                                  setShow(false);
                                }}
                                className="flex items-center gap-3 w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-sm font-medium text-gray-400 hover:text-white"
                              >
                                <ClockIcon className="h-5 w-5" />
                                View History
                              </button>
                            </div>
                          </section>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </>
    )
  },
)
