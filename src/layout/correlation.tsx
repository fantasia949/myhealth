import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAtom, useAtomValue } from "jotai";
import { dataAtom, rankedDataMapAtom, nonInferredDataAtom } from "../atom/dataAtom";
import { correlationAlphaAtom, correlationAlternativeAtom, correlationMethodAtom } from "../atom/correlationAtom";
import { calculateSpearmanRanked, calculatePearson } from "../processors/stats";

interface CorrelationProps {
  target: string | null;
  onClose: () => void;
}

export default React.memo(({ target, onClose }: CorrelationProps) => {
  const data = useAtomValue(nonInferredDataAtom);
  const fullData = useAtomValue(dataAtom); // Access full data for source lookup
  const rankedDataMap = useAtomValue(rankedDataMapAtom);
  const [alpha, setAlpha] = useAtom(correlationAlphaAtom);
  const [alternative, setAlternative] = useAtom(correlationAlternativeAtom);
  const [method, setMethod] = useAtom(correlationMethodAtom);

  const entries = React.useMemo(() => {
    if (!Array.isArray(data) || !target) {
      return;
    }

    const entries: [string, number, number, number][] = [];

    // Helper to get raw numeric values for Pearson from FULL DATA
    const getValues = (name: string) => {
       const entry = fullData.find(d => d[0] === name);
       return entry ? entry[1] : null;
    };

    if (method === 'pearson') {
        const sourceValues = getValues(target);
        if (!sourceValues) return;

        // Optimization: Hoist invariant calculations for the source biomarker outside the target loop.
        // Pre-parse the source values and record valid indices to avoid O(N * M) parsing and null checks.
        const len = sourceValues.length;
        const parsedSource = new Float64Array(len);
        const validIndices: number[] = [];

        for (let i = 0; i < len; i++) {
          const v = sourceValues[i];
          if (v !== null) {
            const vNum = Number(v);
            if (!isNaN(vNum)) {
              parsedSource[i] = vNum;
              validIndices.push(i);
            }
          }
        }

        // Optimization: Pre-allocate Float64Arrays for pairwise values and reuse them
        // across targets to avoid the overhead of `[]` array allocations and `push()` inside the loop.
        const maxLen = validIndices.length;
        const x = new Float64Array(maxLen);
        const y = new Float64Array(maxLen);

        // Iterate over filtered data (non-inferred) as targets
        for (const item of data) {
            if (item[0] === target) continue;
            const targetValues = item[1];

            // Pairwise deletion for Pearson
            let count = 0;

            // Only iterate over indices where the source biomarker has a valid numeric value
            for (let j = 0; j < maxLen; j++) {
              const i = validIndices[j];
              const t = targetValues[i];

              if (t !== null) {
                 const tNum = Number(t);
                 if (!isNaN(tNum)) {
                     x[count] = parsedSource[i];
                     y[count] = tNum;
                     count++;
                 }
              }
            }

            if (count < 4) continue;

            const result = calculatePearson(x.subarray(0, count), y.subarray(0, count), { alpha, alternative });
             if (result.pValue <= alpha) {
                entries.push([item[0], result.statistic, result.pValue, result.pcorr]);
            }
        }
    } else {
        // Spearman (existing optimization)
        const sourceRanks = rankedDataMap.get(target);
        if (!sourceRanks) return;

        for (const item of data) {
          if (item[0] === target) {
            continue;
          }

          const targetRanks = rankedDataMap.get(item[0]);
          if (!targetRanks) continue;

          const result = calculateSpearmanRanked(sourceRanks, targetRanks, {
            alpha: alpha,
            alternative: alternative,
          });
          if (result.pValue <= alpha) {
            entries.push([item[0], result.statistic, result.pValue, result.pcorr]);
          }
        }
    }

    entries.sort((a, b) => a[2] - b[2]);

    return entries;
  }, [data, fullData, target, alpha, alternative, rankedDataMap, method]);

  return (
    <Transition appear show={!!target} as={Fragment}>
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
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md transform transition-all">
                  <div className="flex h-full flex-col overflow-y-scroll bg-[#222222] border-l border-gray-700 shadow-xl">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-white">
                          Correlation Analysis: <span className="text-blue-400">{target}</span>
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            onClick={onClose}
                            aria-label="Close dialog"
                            title="Close dialog"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-2 flex-1 px-4 sm:px-6">
                      <div className="mb-4 p-3 border border-gray-700 rounded bg-dark-bg/50">
                        <div className="text-xs font-bold mb-2 text-gray-400 uppercase tracking-wider">{method === 'pearson' ? 'Pearson' : 'Spearman'} Correlation Settings</div>
                        <div className="flex flex-col gap-2">
                           <div className="flex justify-between items-center">
                            <label htmlFor="corr-method" className="text-xs text-gray-300">Method:</label>
                            <select
                              id="corr-method"
                              value={method}
                              onChange={(e) => setMethod(e.target.value as any)}
                              className="w-24 px-2 py-1 bg-dark-bg border border-gray-600 rounded text-xs focus:border-blue-500 outline-none transition-colors text-white"
                            >
                              <option value="spearman">Spearman</option>
                              <option value="pearson">Pearson</option>
                            </select>
                          </div>
                          <div className="flex justify-between items-center">
                            <label htmlFor="corr-alpha" className="text-xs text-gray-300">Alpha Threshold:</label>
                                                        <select
                              id="corr-alpha"
                              value={alpha}
                              onChange={(e) => setAlpha(Number(e.target.value))}
                              className="w-24 px-2 py-1 bg-dark-bg border border-gray-600 rounded text-xs focus:border-blue-500 outline-none transition-colors text-white"
                            >
                              <option value={0.05}>0.05</option>
                              <option value={0.01}>0.01</option>
                              <option value={0.005}>0.005</option>
                              <option value={0.001}>0.001</option>
                            </select>
                          </div>
                          <div className="flex justify-between items-center">
                            <label htmlFor="corr-alt" className="text-xs text-gray-300">Hypothesis:</label>
                            <select
                              id="corr-alt"
                              value={alternative}
                              onChange={(e) => setAlternative(e.target.value as any)}
                              className="w-24 px-2 py-1 bg-dark-bg border border-gray-600 rounded text-xs focus:border-blue-500 outline-none transition-colors text-white"
                            >
                              <option value="two-sided">Two-sided</option>
                              <option value="less">Less</option>
                              <option value="greater">Greater</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <table className="min-w-full mb-8">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th scope="col" className="text-left text-xs text-gray-500 uppercase tracking-wider font-semibold py-2 px-1">Biomarker</th>
                            <th scope="col" className="text-right text-xs text-gray-500 uppercase tracking-wider font-semibold py-2 px-1 w-24">P-Value</th>
                            <th scope="col" className="text-right text-xs text-gray-500 uppercase tracking-wider font-semibold py-2 px-1 w-20">Coeff</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {entries && entries.length > 0 ? (
                            entries.map((entry) => (
                              <tr
                                key={entry[0]}
                                className="hover:bg-white/5 transition-colors"
                              >
                                <td className="py-2 px-1 text-sm text-gray-200 truncate max-w-[200px]" title={entry[0]}>
                                  {entry[0]}
                                </td>
                                <td className={`py-2 px-1 text-right font-mono text-xs whitespace-nowrap ${entry[2] < 0.001 ? "text-green-400" : "text-gray-400"}`}>
                                  {entry[2].toFixed(6)}
                                </td>
                                <td className={`py-2 px-1 text-right font-mono text-xs whitespace-nowrap ${Math.abs(entry[3]) > 0.7 ? "text-blue-400 font-bold" : "text-gray-400"}`}>
                                  {entry[3].toFixed(4)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="py-12 text-center text-sm text-gray-400 border border-dashed border-gray-700 rounded bg-white/5" role="status" aria-live="polite">
                                No significant correlations found.<br/>
                                <span className="text-xs mt-2 block text-gray-500">Try increasing the Alpha threshold or changing the hypothesis.</span>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});
