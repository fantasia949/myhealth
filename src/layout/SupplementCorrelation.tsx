import React, { Fragment, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useAtomValue } from 'jotai'
import { noteValuesAtom, dataMapAtom } from '../atom/dataAtom'

import { rankData, calculatePearson } from '../processors/stats'
import {
  SupplementCorrelationProps,
  SupplementCorrelationResult,
} from './SupplementCorrelation.types'
import { SUPPLEMENT_CORRELATION_EXCLUDED_BIOMARKERS } from '../config/correlations'
import SupplementCorrelationGraph from './SupplementCorrelationGraph'

const SupplementCorrelation = React.memo(
  ({ supplementName, onClose }: SupplementCorrelationProps) => {
    const [isCopied, setIsCopied] = React.useState(false)
    const noteValues = useAtomValue(noteValuesAtom)
    const dataMap = useAtomValue(dataMapAtom)
    const alpha = 0.05

    const correlations = useMemo(() => {
      if (!supplementName) return []

      // 1. First, build the boolean array for this specific supplement across all dates
      const maxLen = noteValues.length
      const suppVector = new Int8Array(maxLen)
      let suppFrequency = 0

      for (let i = 0; i < maxLen; i++) {
        const note = noteValues[i]
        if (note && note.supps) {
          let hasSupp = false
          for (let j = 0; j < note.supps.length; j++) {
            if (note.supps[j] === supplementName) {
              hasSupp = true
              break
            }
          }
          if (hasSupp) {
            suppVector[i] = 1
            suppFrequency++
          }
        }
      }

      // Check if there is variation in the supplement vector
      let hasSuppVariation = false
      const firstVal = suppVector[0]
      for (let i = 1; i < maxLen; i++) {
        if (suppVector[i] !== firstVal) {
          hasSuppVariation = true
          break
        }
      }

      if (!hasSuppVariation) {
        return []
      }

      const results: SupplementCorrelationResult[] = []

      // ⚡ Bolt Optimization: Hoist options object outside the loop to avoid recreating it
      // on every iteration. This reduces memory allocations and garbage collection overhead.
      const options = { alpha, alternative: 'two-sided' as const }

      // 2. Iterate through all biomarkers
      // ⚡ Bolt Optimization: Replaced dataMap.forEach with a native for...of loop.
      // Iterating over Map entries natively avoids creating a new function closure
      // and its associated environment allocations on every run of this useMemo.

      // ⚡ Bolt Optimization: Pre-allocate TypedArrays outside the loop and reuse them
      // via .subarray() to eliminate O(N) array allocations inside the hot correlation loop.
      const sharedValidIndices = new Int32Array(maxLen)
      const sharedFilteredBiomarkerValues = new Float64Array(maxLen)
      const sharedFilteredSuppVector = new Float64Array(maxLen)

      for (const [biomarkerId, biomarkerEntry] of dataMap.entries()) {
        if (SUPPLEMENT_CORRELATION_EXCLUDED_BIOMARKERS.includes(biomarkerId)) continue
        const rawValues = biomarkerEntry[1] // number[]

        if (rawValues.length !== maxLen) {
          // Skip mismatches
          continue
        }

        // 3. Find valid indices where biomarker has a value
        let count = 0

        for (let i = 0; i < maxLen; i++) {
          const val = rawValues[i]
          if (val !== null && val !== undefined) {
            const numVal = Number(val)
            if (!isNaN(numVal)) {
              sharedFilteredBiomarkerValues[count] = numVal
              sharedValidIndices[count] = i
              count++
            }
          }
        }

        if (count < 3) continue // Need at least 3 valid points

        const filteredBiomarkerValues = sharedFilteredBiomarkerValues.subarray(0, count)
        const filteredSuppVector = sharedFilteredSuppVector.subarray(0, count)

        for (let k = 0; k < count; k++) {
          filteredSuppVector[k] = suppVector[sharedValidIndices[k]]
        }

        // Check variation in filtered supp vector
        let hasLocalVariation = false
        const localFirstVal = filteredSuppVector[0]
        for (let k = 1; k < count; k++) {
          if (filteredSuppVector[k] !== localFirstVal) {
            hasLocalVariation = true
            break
          }
        }

        if (!hasLocalVariation) continue

        // Rank continuous variable for Spearman equivalent
        const rankedBiomarkerValues = rankData(filteredBiomarkerValues)

        // ⚡ Bolt Optimization: Point-biserial correlation is mathematically equivalent to Pearson
        // correlation on the ranked continuous variable against the unranked binary indicator variable.
        // This bypasses the ranking overhead for the binary vectors completely.
        // Also avoid double-calling calculatePearson by deriving one-sided p-value from two-sided.
        const result = calculatePearson(rankedBiomarkerValues, filteredSuppVector, options)

        const rho = result.pcorr

        if (rho === undefined || isNaN(rho)) continue

        // Derive one-sided p-value equivalent to autoAlternative (rho > 0 ? 'greater' : 'less')
        const pVal = result.pValue / 2

        if (rho !== undefined && !isNaN(rho) && pVal <= 0.1) {
          results.push({
            name: biomarkerId,
            rho: rho,
            pValue: pVal,
            count: suppFrequency, // Global frequency of supplement, or could track co-occurrence count
          })
        }
      }

      return results.sort((a, b) => a.pValue - b.pValue)
    }, [supplementName, noteValues, dataMap, alpha])

    if (!supplementName) return null

    return (
      <Transition appear show={!!supplementName} as={Fragment}>
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
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden bg-[#222222] text-dark-text shadow-xl transition-all h-screen ml-auto border-l border-gray-700 flex flex-col">
                  <div className="p-6 pb-2 border-b border-gray-700 flex justify-between items-center shrink-0">
                    <Dialog.Title className="text-lg font-medium leading-6 truncate pr-2">
                      Correlations: {supplementName}
                    </Dialog.Title>
                    <div className="flex items-center gap-2 shrink-0">
                      {correlations && correlations.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const header = 'Biomarker\tFreq\tP-Value\tRho\n'
                            const rows = correlations
                              .map(
                                (item) =>
                                  `${item.name}\t${item.count}\t${item.pValue.toFixed(4)}\t${item.rho.toFixed(3)}`,
                              )
                              .join('\n')
                            navigator.clipboard.writeText(header + rows).then(() => {
                              setIsCopied(true)
                              setTimeout(() => setIsCopied(false), 2000)
                            })
                          }}
                          className="text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1"
                          title={isCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
                          aria-label={isCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
                          aria-live="polite"
                        >
                          {isCopied ? (
                            <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                          ) : (
                            <ClipboardDocumentIcon className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        onClick={onClose}
                        title="Close dialog"
                        aria-label="Close dialog"
                      >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 relative">
                    {correlations.length === 0 ? (
                      <div
                        className="flex items-center justify-center h-64 text-gray-400"
                        role="status"
                        aria-live="polite"
                      >
                        No significant correlations found for this supplement.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-8">
                        <div className="h-[400px] w-full shrink-0 border border-gray-700 rounded bg-[#1a1a1a]">
                          <SupplementCorrelationGraph
                            supplementName={supplementName}
                            correlations={correlations}
                          />
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-700">
                            <thead>
                              <tr>
                                <th
                                  scope="col"
                                  className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                                >
                                  Biomarker
                                </th>
                                <th
                                  scope="col"
                                  className="py-3 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider"
                                >
                                  Freq
                                </th>
                                <th
                                  scope="col"
                                  className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                                >
                                  P-Value
                                </th>
                                <th
                                  scope="col"
                                  className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                                >
                                  Rho
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                              {correlations.map((item) => (
                                <tr
                                  key={item.name}
                                  className="hover:bg-gray-800/50 transition-colors"
                                >
                                  <td className="py-3 px-4 text-sm font-medium text-gray-200">
                                    {item.name}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-center text-gray-400 font-mono">
                                    {item.count}
                                  </td>
                                  <td
                                    className={`py-3 px-4 text-sm text-right font-mono font-bold ${
                                      item.pValue <= 0.05 ? 'text-green-500' : 'text-gray-400'
                                    }`}
                                  >
                                    {item.pValue.toFixed(4)}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-right text-gray-400 font-mono">
                                    {item.rho > 0 ? '+' : ''}
                                    {item.rho.toFixed(3)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  },
)

export default SupplementCorrelation
