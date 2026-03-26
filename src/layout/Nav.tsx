import React, { Fragment } from 'react'
import cn from 'classnames'
import { Dialog, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
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
} from '../atom/dataAtom'
import { calculateSpearmanRanked } from '../processors/stats'
import { averageCountAtom } from '../atom/averageValueAtom'
import Markdown from 'react-markdown'
import { Spinner } from './Spinner'
import { NavProps } from './Nav.types'

export default React.memo<NavProps>(
  ({
    selected,
    onSelect,
    chartType,
    onChartTypeChange,
    onClearSelection,
    filterText,
    filterTag,
    showOrigColumns,
    showRecords,
    onShowRecordsChange,
    onTextChange,
    onFilterByTag,
    onOriginValueToggle,
    onVisualize,
    onPValue,
  }) => {
    const [averageCount, setAverageCount] = useAtom(averageCountAtom)
    const key = useAtomValue(aiKeyAtom)
    const model = useAtomValue(aiModelAtom)
    const gistToken = useAtomValue(gistTokenAtom)
    const data = useAtomValue(visibleDataAtom)
    const fullData = useAtomValue(dataAtom)
    const rankedDataMap = useAtomValue(rankedDataMapAtom)
    const [show, setShow] = React.useState(false)
    const [isAsking, setIsAsking] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [isCopied, setIsCopied] = React.useState(false)
    const searchInputRef = React.useRef<HTMLInputElement>(null)

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

    const onToggle = () => setShow((v) => !v)

    const onAskAI = React.useCallback(
      async () => {
        if (selected.length === 0) {
          return
        }
        setIsAsking(true)

        try {
          // Optimization: Use a Set for O(1) lookups instead of O(N) array.includes inside multiple filter loops.
          // This reduces overall filtering complexity from O(M * N * 4) to O(M + N * 4).
          const selectedSet = new Set(selected)

          const pairs = data
            .filter(([key]) => selectedSet.has(key))
            .map(([key, values, unit]) => `${key} ${values[values.length - 1]} ${unit || ''}`)
          const prevPairs = data
            .filter(([key]) => selectedSet.has(key))
            .map(([key, values, unit]) =>
              values.length > 1 ? `${key} ${values[values.length - 2]} ${unit || ''}` : undefined,
            )
            .filter((item): item is string => !!item)
          const relatedContext = (() => {
            if (!fullData || fullData.length === 0) return undefined

            const selectedEntries = fullData.filter((d) => selectedSet.has(d[0]))
            const candidates = fullData.filter((d) => !d[3].inferred && !selectedSet.has(d[0]))
            const related = new Map<string, string>()

            // Optimization: Use pre-calculated ranks for all sources and candidates to avoid
            // redundant sorting (O(V log V)) inside the O(S * N) loop.
            // This reduces complexity from O(S * N * V log V) to O(S * N * V).

            for (const source of selectedEntries) {
              const sourceRanks = rankedDataMap.get(source[0])
              if (!sourceRanks) continue

              for (const target of candidates) {
                if (related.has(target[0])) continue

                const targetRanks = rankedDataMap.get(target[0])
                if (!targetRanks) continue

                const res = calculateSpearmanRanked(sourceRanks, targetRanks, {
                  // TODO: should not be hardcoded?
                  alpha: 0.05,
                  alternative: 'two-sided',
                })

                if (res.pValue <= 0.05 && Math.abs(res.statistic) >= 0.4) {
                  const val = target[1][target[1].length - 1]
                  if (!val) {
                    console.log('the test does not include this marker, so skip it', target[0])
                    continue
                  }
                  const unit = target[2] || ''
                  related.set(
                    target[0],
                    `- ${target[0]}: ${val} ${unit} (Correlation: ${res.statistic.toFixed(
                      2,
                    )}, P-Value: ${res.pValue.toFixed(4)})`,
                  )
                }
              }
            }
            if (related.size === 0) return undefined
            return (
              'Related Biomarkers (Significant Correlations):\n' +
              Array.from(related.values()).join('\n')
            )
          })()

          const text = await askBioMarkers(pairs, key, model, filterTag, prevPairs, relatedContext)
          setCanvasText(text)
        } catch (err) {
          console.error(err)
          alert(err)
        } finally {
          setIsAsking(false)
        }
      },
      [selected, data, filterTag, key, model, fullData],
    )

    const [canvasText, setCanvasText] = React.useState<string | null>(null)
    const [gistUrl, setGistUrl] = React.useState<string | null>(null)
    const [gistError, setGistError] = React.useState<string | null>(null)
    const [isGistLoading, setIsGistLoading] = React.useState(false)

    const handleClose = React.useCallback(() => {
      setCanvasText(null)
      setGistUrl(null)
      setGistError(null)
      setIsGistLoading(false)
    }, [])

    const onAverageCount = React.useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => setAverageCount(e.target.value),
      [],
    )
    return (
      <>
        <nav
          className={cn(
            'flex flex-wrap items-center justify-between p-4 sticky top-0 left-0 z-20 gap-3 transition-colors duration-300 ease-in-out',
            {
              'bg-dark-accent': !isScrolled,
              'bg-dark-accent-solid': isScrolled,
            },
          )}
        >
          <div className="flex flex-wrap lg:flex-nowrap w-full items-center justify-between px-3 gap-3">
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              type="button"
              onClick={onToggle}
              aria-label="Toggle menu"
              title="Toggle menu"
              aria-expanded={show}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="w-full min-w-40 lg:w-auto flex-1 lg:flex-none">
              <div className="relative text-gray-400 focus-within:text-gray-200">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={filterText}
                  onChange={onTextChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      onTextChange({
                        target: { value: '' },
                      } as React.ChangeEvent<HTMLInputElement>)
                      e.currentTarget.blur()
                    }
                  }}
                  autoFocus
                  className="w-full pl-10 pr-10 py-2 bg-dark-bg text-dark-text border border-gray-600 rounded focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 placeholder-gray-500 focus:placeholder-gray-400"
                  placeholder="Search"
                  aria-label="Search biomarkers"
                />
                {!filterText && !isFocused && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <kbd className="hidden sm:inline-block border border-gray-600 rounded px-1.5 py-0.5 text-xs text-gray-500 font-sans">
                      /
                    </kbd>
                  </div>
                )}
                {filterText && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    onClick={() => {
                      onTextChange({
                        target: { value: '' },
                      } as React.ChangeEvent<HTMLInputElement>)
                      searchInputRef.current?.focus()
                    }}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div
              className={cn('w-full lg:flex lg:flex-1 lg:items-center lg:gap-4 lg:h-8', {
                'hidden lg:flex': !show,
                'grid grid-cols-3 gap-2': show,
              })}
            >
              <ul className="contents lg:flex lg:flex-row xl:gap-1 lg:items-center list-none p-0 m-0">
                {tags.map((tag: string) => (
                  <li className="nav-item contents lg:block" key={tag}>
                    <button
                      type="button"
                      data-tag={tag}
                      aria-pressed={filterTag === tag}
                      className={cn(
                        'px-3 py-2 rounded transition-colors w-full lg:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                        {
                          'bg-blue-600 text-white': filterTag == tag,
                          'text-gray-300 hover:text-white hover:bg-gray-700': filterTag != tag,
                        },
                      )}
                      onClick={onFilterByTag}
                    >
                      {tag.slice(2)}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="lg:ml-2 px-4 py-1 text-sm bg-yellow-500 text-black rounded hover:bg-yellow-400 w-full lg:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onFilterByTag}
                disabled={filterTag == null}
                title={filterTag == null ? 'Select a tag to filter' : 'Reset tag filter'}
                aria-label="Reset tag filter"
              >
                Reset
              </button>

              {selected.length > 0 && (
                <div className="col-span-3 lg:col-span-1 lg:flex lg:flex-1 lg:items-center lg:flex-wrap lg:gap-2 lg:self-baseline bg-dark-table-row border border-gray-700 rounded-md p-1.5 lg:p-1 w-full lg:w-auto mt-2 lg:mt-0 shadow-inner">
                  <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
                    <span className="text-xs text-gray-400 font-medium px-1">Selected:</span>
                    {selected.map((item) => (
                      <span
                        key={item}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-900/50 text-blue-200 border border-blue-800/50 rounded-full"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => onSelect(item)}
                          className="hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded-full"
                          aria-label={`Remove ${item} from selection`}
                          title={`Remove ${item} from selection`}
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {selected.length > 1 && (
                      <button
                        type="button"
                        onClick={onClearSelection}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors ml-0.5"
                        aria-label="Clear all selected items"
                        title="Clear All"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="w-full h-px lg:w-px lg:h-5 bg-gray-700 my-1.5 lg:my-0 lg:mx-1 hidden lg:block"></div>

                  <div className="flex flex-wrap items-center gap-2 mt-2 lg:mt-0">
                    <button
                      type="button"
                      onClick={onPValue}
                      disabled={selected.length !== 2}
                      title={
                        selected.length !== 2
                          ? 'Select exactly 2 items to calculate P-Value'
                          : 'Calculate P-Value'
                      }
                      className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                    >
                      P-Value
                    </button>
                    <button
                      type="button"
                      onClick={onAskAI}
                      disabled={isAsking}
                      title={isAsking ? 'Asking AI...' : 'Ask AI'}
                      className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors flex items-center justify-center gap-1 min-w-[70px]"
                      aria-busy={isAsking}
                    >
                      {isAsking ? <Spinner /> : null}
                      {isAsking ? 'Asking...' : 'Ask AI'}
                    </button>
                    <div className="w-px h-4 bg-gray-600 mx-0.5 hidden sm:block"></div>
                    <select
                      className="px-2 py-1 bg-dark-bg text-dark-text border border-gray-600 rounded text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      value={chartType}
                      onChange={(e) => onChartTypeChange(e.target.value)}
                      aria-label="Select chart type"
                    >
                      <option value="scatter">Scatter Chart</option>
                    </select>
                    <button
                      type="button"
                      onClick={onVisualize}
                      title="Visualize selected biomarkers"
                      className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                    >
                      Visualize
                    </button>
                  </div>
                </div>
              )}

              <div className="hidden contents lg:flex lg:ml-auto lg:flex-row lg:gap-4 lg:items-center">
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <select
                    className="flex-1 lg:flex-none px-3 py-1 bg-dark-bg text-dark-text border border-gray-600 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    value={averageCount.toString()}
                    onChange={onAverageCount}
                    aria-label="Select average count"
                  >
                    <option value="">No average</option>
                    <option value="3">Average of last 3 tests</option>
                    <option value="5">Average of last 5 tests</option>
                    <option value="10">Average of last 10 tests</option>
                    <option value="15">Average of last 15 tests</option>
                  </select>
                </div>
                <div className="hidden lg:flex items-center gap-2 lg:w-auto">
                  <select
                    className="flex-1 lg:flex-none px-3 py-1 bg-dark-bg text-dark-text border border-gray-600 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    value={showRecords.toString()}
                    onChange={onShowRecordsChange}
                    aria-label="Select number of records to show"
                  >
                    <option value="0">All</option>
                    <option value="3">Last 3 records</option>
                    <option value="5">Last 5 records</option>
                    <option value="10">Last 10 records</option>
                    <option value="15">Last 15 records</option>
                  </select>
                </div>
                <div className="hidden xl:flex items-center gap-2 w-full xl:w-auto">
                  <input
                    className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    type="checkbox"
                    checked={showOrigColumns}
                    onChange={onOriginValueToggle}
                    id="flexSwitchCheckDefault"
                    aria-label="Origin values"
                  />
                  <label
                    className="text-sm cursor-pointer select-none"
                    htmlFor="flexSwitchCheckDefault"
                  >
                    Origin values
                  </label>
                </div>
              </div>
            </div>
          </div>
        </nav>

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
                  <Dialog.Panel className="flex flex-col w-full max-w-md transform overflow-hidden bg-[#222222] text-dark-text p-6 text-left align-middle shadow-xl transition-all h-screen ml-auto border-l border-gray-700">
                    <Dialog.Title
                      as="div"
                      className="flex justify-between items-center text-lg font-medium leading-6 mb-4"
                    >
                      <span>Biomarker</span>
                      <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                        aria-label="Close dialog"
                        title="Close dialog"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </Dialog.Title>
                    <div className="mt-2 text-sm whitespace-pre-wrap overflow-y-auto">
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
                        className={`px-4 py-2 border rounded flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-w-[160px] ${
                          isCopied
                            ? 'border-green-600 text-green-400 bg-green-900/20'
                            : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                        aria-label="Copy analysis to clipboard"
                        title="Copy analysis to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <CheckIcon className="h-5 w-5" /> Copied!
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-5 w-5" /> Copy Analysis
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        disabled={isGistLoading}
                        aria-busy={isGistLoading}
                        aria-label="Save analysis to Gist"
                        title="Save analysis to Gist"
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
                            className="text-blue-400 hover:underline"
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
      </>
    )
  },
)
