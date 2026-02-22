import React, { Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAtomValue } from "jotai";
import {
  notesAtom,
  dataAtom,
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
  const data = useAtomValue(dataAtom); // Access raw data
  const alpha = 0.05;
  const alternative = useAtomValue(correlationAlternativeAtom);

  const correlations = useMemo(() => {
    if (!biomarkerId) return [];

    // Find the biomarker entry in the raw data
    const biomarkerEntry = data.find((entry) => entry[0] === biomarkerId);
    if (!biomarkerEntry) return [];

    const rawValues = biomarkerEntry[1]; // number[]

    // Extract all unique supplements
    // notes is an object keyed by date string. The values order corresponds to the data indices.
    const noteValues = Object.values(notes);

    // Safety check: ensure lengths match
    if (rawValues.length !== noteValues.length) {
      console.warn("Biomarker values and notes length mismatch", rawValues.length, noteValues.length);
    }

    const uniqueSupplements = new Set<string>();
    noteValues.forEach((note) => {
      note.supps?.forEach((supp) => uniqueSupplements.add(supp));
    });

    const results: CorrelationResult[] = [];

    uniqueSupplements.forEach((suppName) => {
      // 1. Identify valid indices: where biomarker value > 0
      const validIndices: number[] = [];
      rawValues.forEach((val: any, index) => {
        // Cast to number just in case it's a string like "5.0"
        const numVal = Number(val);
        if (!isNaN(numVal) && numVal > 0) {
            validIndices.push(index);
        }
      });

      // If we don't have enough data points, we can't correlate
      if (validIndices.length < 3) return;

      // 2. Extract filtered vectors
      const filteredBiomarkerValues: number[] = [];
      const filteredSuppVector: number[] = [];

      validIndices.forEach(i => {
         // Check if supplement was present at this index
         // Ensure note exists at index i
         if (i < noteValues.length) {
             const note = noteValues[i];
             filteredBiomarkerValues.push(Number(rawValues[i]));
             filteredSuppVector.push(note && note.supps?.includes(suppName) ? 1 : 0);
         }
      });

      if (filteredBiomarkerValues.length < 3) return;

      // Check if there is variation in the supplement vector
      const hasSuppVariation = filteredSuppVector.some(v => v !== filteredSuppVector[0]);
      if (!hasSuppVariation) {
        return;
      }

      // Check variation in biomarker values
      const hasBiomarkerVariation = filteredBiomarkerValues.some(v => v !== filteredBiomarkerValues[0]);
      if (!hasBiomarkerVariation) {
          return;
      }

      // 3. Rank the filtered vectors
      const rankedBiomarker = rankData(filteredBiomarkerValues);
      const rankedSupp = rankData(filteredSuppVector);

      // 4. Calculate Spearman correlation
      const result: any = calculateSpearmanRanked(rankedBiomarker, rankedSupp, {
        alpha,
        alternative,
      });

      const rho = result.statistic !== undefined ? result.statistic : result.pcorr;
      const pVal = result.pValue;

      // Filter out invalid results (e.g., if rho is NaN)
      // AND filter out results with pValue > 0.1 per requirement
      if (rho !== undefined && !isNaN(rho) && pVal <= 0.1) {
        results.push({
          name: suppName,
          rho: rho,
          pValue: pVal,
        });
      }
    });

    // Sort by P-value ascending
    return results.sort((a, b) => a.pValue - b.pValue);
  }, [biomarkerId, notes, data, alpha, alternative]);

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
                              item.pValue < 0.05 ? "text-green-400 font-bold" : "text-gray-400"
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
                            className="py-4 text-center text-sm text-gray-500"
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
  );
});

export default BiomarkerCorrelation;
