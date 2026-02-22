import React, { Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAtomValue } from "jotai";
import {
  notesAtom,
  rankedDataMapAtom,
  correlationAlphaAtom,
  correlationAlternativeAtom,
} from "../atom/dataAtom";
import { calculateSpearmanRanked, rankData } from "../processors/stats";

interface BiomarkerCorrelationProps {
  biomarkerId: string | null;
  onClose: () => void;
}

interface CorrelationResult {
  name: string;
  rho: number;
  pValue: number;
}

const BiomarkerCorrelation = React.memo(({ biomarkerId, onClose }: BiomarkerCorrelationProps) => {
  const notes = useAtomValue(notesAtom);
  const rankedDataMap = useAtomValue(rankedDataMapAtom);
  const alpha = useAtomValue(correlationAlphaAtom);
  const alternative = useAtomValue(correlationAlternativeAtom);

  const correlations = useMemo(() => {
    if (!biomarkerId) return [];

    const biomarkerRanks = rankedDataMap.get(biomarkerId);
    if (!biomarkerRanks) return [];

    // Extract all unique supplements
    // notes is an object keyed by date string. The values order corresponds to the data indices.
    const noteValues = Object.values(notes);
    const uniqueSupplements = new Set<string>();
    noteValues.forEach((note) => {
      note.supps?.forEach((supp) => uniqueSupplements.add(supp));
    });

    const results: CorrelationResult[] = [];

    uniqueSupplements.forEach((suppName) => {
      // Create binary vector: 1 if supplement is present, 0 otherwise
      const binaryVector = noteValues.map((note) =>
        note.supps?.includes(suppName) ? 1 : 0
      );

      // Rank the binary vector
      const rankedSupp = rankData(binaryVector);

      // Calculate Spearman correlation
      const result = calculateSpearmanRanked(biomarkerRanks, rankedSupp, {
        alpha,
        alternative,
      });

      // Filter out invalid results (e.g., if rho is NaN)
      if (result.rho !== undefined && !isNaN(result.rho)) {
        results.push({
          name: suppName,
          rho: result.rho,
          pValue: result.pValue,
        });
      }
    });

    // Sort by P-value ascending
    return results.sort((a, b) => a.pValue - b.pValue);
  }, [biomarkerId, notes, rankedDataMap, alpha, alternative]);

  if (!biomarkerId) return null;

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
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded shrink-0"
                    aria-label="Close dialog"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
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
                          Rho
                        </th>
                        <th
                          scope="col"
                          className="py-3 pl-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider bg-[#222222]"
                        >
                          P-Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {correlations.map((item) => (
                        <tr key={item.name} className="hover:bg-gray-800 transition-colors">
                          <td className="py-2 pr-2 text-sm text-gray-200 break-words">
                            {item.name}
                          </td>
                          <td className="py-2 px-2 text-sm text-right font-mono text-gray-400 whitespace-nowrap">
                            {item.rho.toFixed(3)}
                          </td>
                          <td
                            className={`py-2 pl-2 text-sm text-right font-mono whitespace-nowrap ${
                              item.pValue < 0.05 ? "text-green-400 font-bold" : "text-gray-400"
                            }`}
                          >
                            {item.pValue.toExponential(2)}
                          </td>
                        </tr>
                      ))}
                      {correlations.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-4 text-center text-sm text-gray-500"
                          >
                            No correlations found.
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
  );
});

export default BiomarkerCorrelation;
