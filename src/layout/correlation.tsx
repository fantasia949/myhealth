import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAtom, useAtomValue, atom } from "jotai";
import { dataAtom, correlationAlphaAtom, correlationAlternativeAtom, rankedDataMapAtom } from "../atom/dataAtom";
import { calculateSpearmanRanked } from "../processors/stats";

interface CorrelationProps {
  target: string | null;
  onClose: () => void;
}

const nonInferredDataAtom = atom((get) => {
  const data = get(dataAtom);
  return data.filter((item) => !item[3]?.inferred);
});

export default React.memo(({ target, onClose }: CorrelationProps) => {
  const data = useAtomValue(nonInferredDataAtom);
  const rankedDataMap = useAtomValue(rankedDataMapAtom);
  const [alpha, setAlpha] = useAtom(correlationAlphaAtom);
  const [alternative, setAlternative] = useAtom(correlationAlternativeAtom);

  const entries = React.useMemo(() => {
    if (!Array.isArray(data) || !target) {
      return;
    }

    // Optimization: lookup O(1) from pre-calculated map
    const sourceRanks = rankedDataMap.get(target);
    if (!sourceRanks) {
      return;
    }

    const entries: [string, number, number, number][] = [];

    for (const item of data) {
      if (item[0] === target) {
        continue;
      }

      // Optimization: lookup O(1) from pre-calculated map instead of calculating ranks O(V log V)
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
    entries.sort((a, b) => a[2] - b[2]);

    return entries;
  }, [data, target, alpha, alternative, rankedDataMap]);

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
                            className="relative rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={onClose}
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
                        <div className="text-xs font-bold mb-2 text-gray-400 uppercase tracking-wider">Spearman Correlation Settings</div>
                        <div className="flex flex-col gap-2">
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

                      <div className="text-xs text-gray-500 mb-2 flex justify-between px-1 uppercase tracking-wider font-semibold">
                        <span>Biomarker</span>
                        <div className="flex gap-4">
                          <span>P-Value</span>
                          <span>Coeff</span>
                        </div>
                      </div>

                      {entries && entries.length > 0 ? (
                        <div className="pb-8">
                          {entries.map((entry) => (
                            <div
                              key={entry[0]}
                              className="flex justify-between items-center border-b border-gray-800 py-2 hover:bg-white/5 px-2 transition-colors rounded-sm"
                            >
                              <span className="text-sm truncate pr-2 text-gray-200" style={{ flex: 1 }} title={entry[0]}>{entry[0]}</span>
                              <div className="flex gap-4 font-mono text-xs">
                                <span className={entry[2] < 0.001 ? "text-green-400" : "text-gray-400"}>{entry[2].toFixed(6)}</span>
                                <span className={Math.abs(entry[3]) > 0.7 ? "text-blue-400 font-bold" : "text-gray-400"}>{entry[3].toFixed(4)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 text-sm py-12 border border-dashed border-gray-700 rounded bg-white/5">
                          No significant correlations found.<br/>
                          <span className="text-xs mt-2 block text-gray-600">Try increasing the Alpha threshold or changing the hypothesis.</span>
                        </div>
                      )}
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
