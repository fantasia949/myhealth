import React, { Fragment, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useAtomValue } from 'jotai'
import { noteValuesAtom, dataMapAtom } from '../atom/dataAtom'
import { correlationAlternativeAtom } from '../atom/correlationAtom'
import { rankData, calculatePearson } from '../processors/stats'
import { BiomarkerCorrelationProps, CorrelationResult } from './BiomarkerCorrelation.types'

const BiomarkerCorrelation = React.memo(({ biomarkerId, onClose }: BiomarkerCorrelationProps) => {
  const [isCopied, setIsCopied] = React.useState(false)
  const noteValues = useAtomValue(noteValuesAtom)
  const dataMap = useAtomValue(dataMapAtom) // Access pre-calculated O(1) map
  const alpha = 0.05
  const alternative = useAtomValue(correlationAlternativeAtom)

  const correlations = useMemo(() => {
    if (!biomarkerId) return []

    // Find the biomarker entry in the raw data
    const biomarkerEntry = dataMap.get(biomarkerId)
    if (!biomarkerEntry) return []

    const rawValues = biomarkerEntry[1] // number[]

    // Extract all unique supplements
    // noteValues order corresponds to the data indices.

    // Safety check: ensure lengths match
    if (rawValues.length !== noteValues.length) {
      console.warn(
        'Biomarker values and notes length mismatch',
        rawValues.length,
        noteValues.length,
      )
    }

    const results: CorrelationResult[] = []

    // Optimization: Hoist invariant calculations outside the loop
    // 1. Identify valid indices: where biomarker value > 0 AND note exists
    // Pre-allocate typed arrays to avoid Array.push() overhead in the hot loop
    const maxLen = rawValues.length
    const validIndicesArray = new Int32Array(maxLen)
    const filteredBiomarkerValuesArray = new Float64Array(maxLen)
    let count = 0

    for (let index = 0; index < maxLen; index++) {
      const val = rawValues[index]
      if (val !== null && val !== undefined) {
        const numVal = Number(val)
        if (!isNaN(numVal) && numVal > 0 && index < noteValues.length) {
          validIndicesArray[count] = index
          filteredBiomarkerValuesArray[count] = numVal
          count++
        }
      }
    }

    const validIndices = validIndicesArray.subarray(0, count)
    const filteredBiomarkerValues = filteredBiomarkerValuesArray.subarray(0, count)

    // If we don't have enough data points, we can't correlate
    if (count < 3) return []

    // Check variation in biomarker values once
    let hasBiomarkerVariation = false
    const firstBioVal = filteredBiomarkerValues[0]
    for (let i = 1; i < count; i++) {
      if (filteredBiomarkerValues[i] !== firstBioVal) {
        hasBiomarkerVariation = true
        break
      }
    }
    if (!hasBiomarkerVariation) return []

    // Rank the filtered biomarker values once
    const rankedBiomarker = rankData(filteredBiomarkerValues)

    // Optimization: Build supplement vectors dynamically over valid indices.
    // This avoids allocating O(K) arrays for supplements that were never taken
    // during the timeframe when this specific biomarker was tested.
    // Using Int8Array instead of standard Array provides zero-initialization by default.
    const suppVectors = new Map<string, Int8Array>()

    // ⚡ Bolt Optimization: Hoist options object outside the loop to avoid recreating it
    // on every iteration. This reduces memory allocations and garbage collection overhead.
    const options = { alpha, alternative }

    for (let k = 0; k < count; k++) {
      const i = validIndices[k]
      const note = noteValues[i]
      if (note && note.supps) {
        for (let j = 0; j < note.supps.length; j++) {
          const supp = note.supps[j]
          let vector = suppVectors.get(supp)
          if (!vector) {
            vector = new Int8Array(count)
            suppVectors.set(supp, vector)
          }
          vector[k] = 1
        }
      }
    }

    suppVectors.forEach((filteredSuppVector, suppName) => {
      // Check if there is variation in the supplement vector
      const firstVal = filteredSuppVector[0]
      let hasSuppVariation = false
      for (let k = 1; k < count; k++) {
        if (filteredSuppVector[k] !== firstVal) {
          hasSuppVariation = true
          break
        }
      }

      if (!hasSuppVariation) {
        return
      }

      // 3. Calculate Spearman correlation
      // Optimization: Point-biserial correlation is mathematically equivalent to Pearson
      // correlation on the ranked continuous variable against the unranked binary indicator variable.
      // This bypasses the ranking overhead for the binary vectors completely.
      const result = calculatePearson(rankedBiomarker, filteredSuppVector, options)

      const rho = result.pcorr
      const pVal = result.pValue

      // Filter out invalid results (e.g., if rho is NaN)
      // AND filter out results with pValue > 0.1 per requirement
      if (rho !== undefined && !isNaN(rho) && pVal <= 0.1) {
        results.push({
          name: suppName,
          rho: rho,
          pValue: pVal,
        })
      }
    })

    // Sort by P-value ascending
    return results.sort((a, b) => a.pValue - b.pValue)
  }, [biomarkerId, noteValues, dataMap, alpha, alternative])

  if (!biomarkerId) return null

  return (
    <Transition appear show={!!biomarkerId} as={Fragment}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-[#222222] text-dark-text shadow-xl transition-all h-screen ml-auto border-l border-gray-700 flex flex-col">
                <div className="p-6 pb-2 border-b border-gray-700 flex justify-between items-center shrink-0">
                  <Dialog.Title className="text-lg font-medium leading-6 truncate pr-2">
                    Correlations: {biomarkerId}
                  </Dialog.Title>
                  <div className="flex items-center gap-2 shrink-0">
                    {correlations && correlations.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const header = 'Supplement\tP-Value\tRho\n'
                          const rows = correlations
                            .map(
                              (item) =>
                                `${item.name}\t${item.pValue.toFixed(4)}\t${item.rho.toFixed(3)}`,
                            )
                            .join('\n')
                          navigator.clipboard.writeText(header + rows)
                          setIsCopied(true)
                          setTimeout(() => setIsCopied(false), 2000)
                        }}
                        className={`px-2 py-1 border text-xs rounded flex items-center justify-center gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-w-[70px] ${
                          isCopied
                            ? 'border-green-600 text-green-400 bg-green-900/20'
                            : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                        title="Copy analysis to clipboard"
                        aria-live="polite"
                      >
                        {isCopied ? (
                          <>
                            <CheckIcon className="h-4 w-4" /> Copied!
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-4 w-4" /> Copy
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded shrink-0"
                      aria-label="Close dialog"
                      title="Close dialog"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto flex-grow p-6 pt-0">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#222222] sticky top-0 z-10">
                      <tr>
                        <th
                          scope="col"
                          className="py-3 pr-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-[#222222]"
                        >
                          Supplement
                        </th>
                        <th
                          scope="col"
                          className="py-3 px-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider bg-[#222222]"
                        >
                          P-Value
                        </th>
                        <th
                          scope="col"
                          className="py-3 pl-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider bg-[#222222]"
                        >
                          Rho
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {correlations.map((item) => (
                        <tr key={item.name} className="hover:bg-gray-800 transition-colors">
                          <td className="py-2 pr-2 text-sm text-gray-200 break-words">
                            {item.name}
                          </td>
                          <td
                            className={`py-2 px-2 text-sm text-right font-mono whitespace-nowrap ${
                              item.pValue < 0.05 ? 'text-green-400 font-bold' : 'text-gray-400'
                            }`}
                          >
                            {item.pValue.toFixed(4)}
                          </td>
                          <td className="py-2 pl-2 text-sm text-right font-mono text-gray-400 whitespace-nowrap">
                            {item.rho.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                      {correlations.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-4 text-center text-sm text-gray-400"
                            role="status"
                            aria-live="polite"
                          >
                            No correlations found (p &le; 0.1, filtered &gt; 0).
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
})

export default BiomarkerCorrelation
