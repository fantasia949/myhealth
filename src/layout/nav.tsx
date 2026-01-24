import React, { Fragment } from "react";
import cn from "classnames";
import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { tags } from "../processors";
import { askBioMarkers } from "../service/askAI";
import { createGist } from "../service/gist";
import { useAtom, useAtomValue } from "jotai";
import { visibleDataAtom, aiKeyAtom, gistTokenAtom, aiModelAtom } from "../atom/dataAtom";
import { averageCountAtom } from "../atom/averageValueAtom";
import Markdown from "react-markdown";

type Props = {
  selected: string[];
  onSelect: (name: string) => void;
  chartType: string;
  onChartTypeChange: (type: string) => void;
  filterText: string;
  filterTag: string | null;
  showOrigColumns: boolean;
  showRecords: number;
  onShowRecordsChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterByTag: (e: React.MouseEvent<HTMLElement>) => void;
  onOriginValueToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVisualize: () => void;
  onPValue: () => void;
  onCorrelation: () => void;
};

export default React.memo<Props>(
  ({
    selected,
    onSelect,
    chartType,
    onChartTypeChange,
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
    onCorrelation,
  }) => {
    const [averageCount, setAverageCount] = useAtom(averageCountAtom);
    const key = useAtomValue(aiKeyAtom);
    const model = useAtomValue(aiModelAtom);
    const gistToken = useAtomValue(gistTokenAtom);
    const data = useAtomValue(visibleDataAtom);
    const [show, setShow] = React.useState(false);
    const onToggle = () => setShow((v) => !v);

    const onAskAI = React.useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (selected.length === 0) {
          return;
        }
        (e.target as HTMLButtonElement).disabled = true;

        try {
          const pairs = data
            .filter(([key]) => selected.includes(key))
            .map(
              ([key, values, unit]) =>
                `${key} ${values[values.length - 1]} ${unit || ""}`
            );
          const prevPairs = data
            .filter(([key]) => selected.includes(key))
            .map(([key, values, unit]) =>
              values.length > 1
                ? `${key} ${values[values.length - 2]} ${unit || ""}`
                : undefined
            )
            .filter(Boolean);
          const text = await askBioMarkers(pairs, key, model, filterTag, prevPairs);
          setCanvasText(text);
        } catch (err) {
          console.error(err);
          alert(err);
        } finally {
          (e.target as HTMLButtonElement).disabled = false;
        }
      },
      [selected, data, filterTag, key]
    );

    const [canvasText, setCanvasText] = React.useState<string | null>(null);
    const [gistUrl, setGistUrl] = React.useState<string | null>(null);
    const [gistError, setGistError] = React.useState<string | null>(null);
    const [isGistLoading, setIsGistLoading] = React.useState(false);

    const handleClose = React.useCallback(() => {
      setCanvasText(null);
      setGistUrl(null);
      setGistError(null);
      setIsGistLoading(false);
    }, []);

    const onAverageCount = React.useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) =>
        setAverageCount(e.target.value),
      []
    );

    const onButtonClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onSelect((e.target as HTMLButtonElement).name);
      },
      [onSelect]
    );

    return (
      <>
        <nav className="flex flex-wrap items-center justify-between p-4 bg-dark-accent sticky top-0 left-0 z-20 gap-3">
          <div className="flex w-full flex-wrap items-center justify-between px-3 gap-3">
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white focus:outline-none"
              type="button"
              onClick={onToggle}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="w-full lg:w-auto lg:flex-none">
              <input
                type="search"
                value={filterText}
                onChange={onTextChange}
                autoFocus
                className="w-full px-3 py-2 bg-dark-bg text-dark-text border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                placeholder="Search"
              />
            </div>
            <div className={cn("w-full lg:flex lg:w-auto lg:items-center", { hidden: !show, block: show })}>
              <ul className="flex flex-col lg:flex-row gap-2 items-start lg:items-center list-none p-0 m-0">
                {tags.map((tag: string) => (
                  <li className="nav-item" key={tag}>
                    <button
                      type="button"
                      data-tag={tag}
                      className={cn("px-3 py-2 rounded transition-colors", {
                        "bg-blue-600 text-white": filterTag == tag,
                        "text-gray-300 hover:text-white hover:bg-gray-700": filterTag != tag,
                      })}
                      onClick={onFilterByTag}
                    >
                      {tag.slice(2)}
                    </button>
                  </li>
                ))}
              </ul>
              {filterTag != null && (
                <button
                  type="button"
                  className="mt-2 lg:mt-0 lg:ml-2 px-4 py-1 text-sm bg-yellow-500 text-black rounded hover:bg-yellow-400"
                  onClick={onFilterByTag}
                >
                  Reset
                </button>
              )}
            </div>

            {selected.length > 0 && (
              <div className="flex gap-2">
                <select
                  className="px-3 py-1 bg-dark-bg text-dark-text border border-gray-600 rounded"
                  value={chartType}
                  onChange={(e) => onChartTypeChange(e.target.value)}
                >
                  <option value="scatter">Scatter Chart</option>
                </select>
                <button
                  type="button"
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
                  onClick={onVisualize}
                >
                  Visualize
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {selected.length === 2 && (
                <button
                  type="button"
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
                  onClick={onPValue}
                >
                  P-Value
                </button>
              )}
              {selected.length === 1 && (
                <button
                  type="button"
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
                  onClick={onCorrelation}
                >
                  Correlations
                </button>
              )}
              {selected.length > 0 && (
                <button
                  type="button"
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
                  onClick={onAskAI}
                >
                  Ask AI
                </button>
              )}
              {selected.map((item) => (
                <button
                  type="button"
                  name={item}
                  key={item}
                  onClick={onButtonClick}
                  className="px-2 py-1 text-sm border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500 hover:text-black"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="lg:ml-auto flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                 <select
                  className="px-3 py-1 bg-dark-bg text-dark-text border border-gray-600 rounded"
                  value={averageCount.toString()}
                  onChange={onAverageCount}
                >
                  <option value=""></option>
                  <option value="3">Average of last 3 tests</option>
                  <option value="5">Average of last 5 tests</option>
                  <option value="10">Average of last 10 tests</option>
                  <option value="15">Average of last 15 tests</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-1 bg-dark-bg text-dark-text border border-gray-600 rounded"
                  value={showRecords.toString()}
                  onChange={onShowRecordsChange}
                >
                  <option value="0">All</option>
                  <option value="3">Last 3 records</option>
                  <option value="5">Last 5 records</option>
                  <option value="10">Last 10 records</option>
                  <option value="15">Last 15 records</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  type="checkbox"
                  checked={showOrigColumns}
                  onChange={onOriginValueToggle}
                  id="flexSwitchCheckDefault"
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-dark-table-row text-dark-text p-6 text-left align-middle shadow-xl transition-all h-screen ml-auto border-l border-gray-700">
                    <Dialog.Title
                      as="div"
                      className="flex justify-between items-center text-lg font-medium leading-6 mb-4"
                    >
                      <span>Biomarker</span>
                      <button onClick={handleClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </Dialog.Title>
                    <div className="mt-2 text-sm whitespace-pre-wrap">
                      <Markdown>{canvasText}</Markdown>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                        disabled={isGistLoading}
                        onClick={async () => {
                          setIsGistLoading(true);
                          setGistError(null);
                          setGistUrl(null);
                          if (!gistToken) {
                            setGistError("Please provide a Gist token.");
                            setIsGistLoading(false);
                            return;
                          }
                          try {
                            const url = await createGist(
                              canvasText!,
                              gistToken
                            );
                            setGistUrl(url);
                          } catch (err: any) {
                            setGistError(err.message);
                          } finally {
                            setIsGistLoading(false);
                          }
                        }}
                      >
                        {isGistLoading ? "Saving..." : "Save to Gist"}
                      </button>
                      {gistUrl && (
                        <div className="mt-2">
                          <a href={gistUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
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
    );
  }
);
