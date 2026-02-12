import React from "react";
import "./index.css";
import DarkVeil from "./layout/DarkVeil";
import Nav from "./layout/nav";
import Table from "./layout/table";
import ScatterChart from "./layout/ScatterChart";
import PValue from "./layout/pValue";
import Correlation from "./layout/correlation";
import { useAtomValue, useAtom } from "jotai";
import {
  getBioMarkersAtom,
  filterTextAtom,
  tagAtom,
  aiKeyAtom,
  aiModelAtom,
  gistTokenAtom,
  BioMarker,
} from "./atom/dataAtom";

export default function App() {
  const data = useAtomValue(getBioMarkersAtom);
  const [selected, setSelect] = React.useState<string[]>([]);
  const [filterText, setFilterText] = useAtom(filterTextAtom);
  const [searchText, setSearchText] = React.useState(filterText);
  const [filterTag, setFilterTag] = useAtom(tagAtom);
  const [aiKey, setAiKey] = useAtom(aiKeyAtom);
  const [aiModel, setAiModel] = useAtom(aiModelAtom);
  const [gistToken, setGistToken] = useAtom(gistTokenAtom);
  const [showOrigColumns, setShowOrigColumns] = React.useState<boolean>(false);
  const [showRecords, setShowRecords] = React.useState<number>(5);
  const [chartKeys, setChartKeys] = React.useState<string[] | null>(null);
  const [chartType, setChartType] = React.useState<string>('scatter');
  const [comparedSourceTarget, setSourceTarget] = React.useState<
    BioMarker[] | null
  >(null);
  const [corrlationKey, setCorrelationKey] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    const handler = setTimeout(() => {
      React.startTransition(() => {
        setFilterText(searchText);
      });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, setFilterText]);

  const onTextChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSearchText(e.target.value),
    []
  );

  const onOriginValueToggle = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setShowOrigColumns(e.target.checked),
    []
  );

  const onShowRecordsChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setShowRecords(+e.target.value),
    []
  );

  const onAiKeyChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setAiKey(e.target.value),
    []
  );

  const onAiModelChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setAiModel(e.target.value),
    []
  );

  const onGistTokenChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setGistToken(e.target.value),
    []
  );

  const onFilterByTag = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    React.startTransition(() => {
      setFilterTag((e.target as HTMLElement).dataset.tag as string);
      setSearchText("");
      setFilterText("");
      setCorrelationKey(null);
      setSelect([]);
      setSourceTarget(null);
    });
    setShowOrigColumns(false);
  }, [setFilterTag, setFilterText, setCorrelationKey, setSelect, setSourceTarget]);

  const onSelect = React.useCallback(
    (name: string) => {
      let values = selected;

      const value = name;
      const index = values.indexOf(value);
      if (index == -1) {
        values = [...values, value];
      } else {
        values = values.toSpliced(index, 1);
      }

      setSelect(values);

      setChartKeys((keys) => {
        if (values.length === 0) {
          return null;
        }
        if (keys) {
          return values;
        }
        return keys;
      });
    },
    [selected, chartKeys]
  );

  const onVisualize = React.useCallback(() => {
    setChartKeys((keys) => (!keys ? selected : null));
  }, [selected]);

  const onPValue = React.useCallback(() => {
    let sourceTarget: (BioMarker | undefined)[] = data.filter(([name]) =>
      selected.includes(name)
    );
    sourceTarget = selected.map(
      (name) => sourceTarget.find((i) => i && i[0] === name)
    );
    if (sourceTarget.some((i) => !i)) {
      return;
    }
    setSourceTarget((v) => {
      if (v && sourceTarget[0] === v[0] && sourceTarget[1] === v[1]) {
        return null;
      }
      return sourceTarget as BioMarker[];
    });
  }, [selected, data]);

  const onCorrelation = React.useCallback(() => {
    setCorrelationKey((v) => {
      if (selected[0] === v) {
        return null;
      }
      return selected[0];
    });
  }, [selected]);

  const onChartTypeChange = React.useCallback((type: string) => {
    setChartType(type);
  }, []);

  const navProps = {
    selected,
    onSelect,
    chartType,
    onChartTypeChange,
    filterText: searchText,
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
  };

  const tableProps = {
    showOrigColumns,
    selected,
    onSelect,
    showRecords,
  };

  return (
    <>
      <div className="fixed inset-0 -z-10">
        <DarkVeil />
      </div>
      <Nav {...navProps} />
      <PValue
        comparedSourceTarget={comparedSourceTarget}
        onClose={() => setSourceTarget(null)}
      />
      <Correlation target={corrlationKey} />
      {chartKeys?.length > 0 && chartType === 'scatter' && <ScatterChart data={data} keys={chartKeys} />}
      <Table {...tableProps} />
      <div className="flex flex-wrap justify-center gap-4 mt-4 pb-8">
        <div className="flex flex-col gap-1">
          <label htmlFor="ai-model" className="text-xs text-gray-400 font-medium ml-1">
            AI Model
          </label>
          <select
            id="ai-model"
            className="px-3 py-2 bg-dark-bg text-dark-text border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            value={aiModel}
            onChange={onAiModelChange}
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-3-flash">Gemini 3 Flash</option>
            <option value="gemini-3-pro">Gemini 3 Pro</option>
            <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
            <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="gemini-key" className="text-xs text-gray-400 font-medium ml-1">
            Gemini API Key
          </label>
          <input
            className="px-3 py-2 bg-dark-bg text-dark-text border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            name="key"
            value={aiKey || ""}
            onChange={onAiKeyChange}
            id="gemini-key"
            placeholder="Gemini key"
            autoComplete="gemini-key"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="gist-token" className="text-xs text-gray-400 font-medium ml-1">
            Gist Token
          </label>
          <input
            className="px-3 py-2 bg-dark-bg text-dark-text border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            name="gist_token"
            value={gistToken || ""}
            onChange={onGistTokenChange}
            id="gist-token"
            placeholder="Gist token"
            autoComplete="gist-token"
          />
        </div>
      </div>
    </>
  );
}
