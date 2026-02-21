import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAtomValue } from "jotai";
import { BioMarker, correlationAlphaAtom, correlationAlternativeAtom, rankedDataMapAtom } from "../atom/dataAtom";
import { calculateSpearmanRanked } from "../processors/stats";

interface PValueProps {
  comparedSourceTarget: BioMarker[] | null;
  onClose: () => void;
}

export default React.memo(({ comparedSourceTarget, onClose }: PValueProps) => {
  const rankedDataMap = useAtomValue(rankedDataMapAtom);
  const alpha = useAtomValue(correlationAlphaAtom);
  const alternative = useAtomValue(correlationAlternativeAtom);

  const text: [string, string] | undefined = React.useMemo(() => {
    if (!Array.isArray(comparedSourceTarget)) {
      return;
    }
    const [source, target] = comparedSourceTarget;

    const sourceRanks = rankedDataMap.get(source[0]);
    const targetRanks = rankedDataMap.get(target[0]);

    if (!sourceRanks || !targetRanks) {
      return;
    }

    const result = calculateSpearmanRanked(sourceRanks, targetRanks, {
      alpha,
      alternative,
    });
    // console.log(result.print());
    return [result.print(), JSON.stringify(result, null, "\t")];
  }, [comparedSourceTarget, alpha, alternative, rankedDataMap]);

  return (
    <Transition appear show={!!text} as={Fragment}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-[#222222] text-dark-text p-6 text-left align-middle shadow-xl transition-all h-screen ml-auto border-l border-gray-700">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center text-lg font-medium leading-6 mb-4"
                >
                  <span>Spearman Rank Correlation</span>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                    aria-label="Close dialog"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>
                <div
                  className="mt-2 text-sm whitespace-pre-wrap"
                  title={text?.[1]}
                  style={{ fontSize: 14 }}
                >
                  {!!text && comparedSourceTarget && (
                    <div className="mb-2 font-bold">
                      {comparedSourceTarget[0][0]}
                      <span className="mx-2">vs</span>
                      {comparedSourceTarget[1][0]}
                    </div>
                  )}
                  {text?.[0]}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});
