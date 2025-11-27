import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./styles.css";
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
  gistTokenAtom,
  BioMarker,
} from "./atom/dataAtom";

export default function App() {
  const data = useAtomValue(getBioMarkersAtom);
  const [selected, setSelect] = React.useState<string[]>([]);
  const [filterText, setFilterText] = useAtom(filterTextAtom);
  const [filterTag, setFilterTag] = useAtom(tagAtom);
  const [aiKey, setAiKey] = useAtom(aiKeyAtom);
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
  const onTextChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      React.startTransition(() => setFilterText(e.target.value)),
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

  const onGistTokenChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setGistToken(e.target.value),
    []
  );

  const onFilterByTag = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    React.startTransition(() => {
      setFilterTag((e.target as HTMLElement).dataset.tag as string);
      setFilterText("");
      setCorrelationKey(null);
      setSelect([]);
      setSourceTarget(null);
    });
    setShowOrigColumns(false);
  }, [setFilterTag, setFilterText, setCorrelationKey, setSelect, setSourceTarget]);

  const onSelect = React.useCallback(
    (name: string) => {
      // debugger;
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
  };

  const tableProps = {
    showOrigColumns,
    selected,
    onSelect,
    showRecords,
  };

  return (
    <>
      <Nav {...navProps} />
      <PValue
        comparedSourceTarget={comparedSourceTarget}
        onClose={() => setSourceTarget(null)}
      />
      <Correlation target={corrlationKey} />
      {chartKeys?.length > 0 && chartType === 'scatter' && <ScatterChart data={data} keys={chartKeys} />}
      <Table {...tableProps} />
      <input
        className="field"
        name="key"
        value={aiKey || ""}
        onChange={onAiKeyChange}
        id="gemini-key"
        placeholder="Gemini key"
        autoComplete="gemini-key"
      />
      <input
        className="field"
        name="key"
        value={gistToken || ""}
        onChange={onGistTokenChange}
        id="gist-token"
        placeholder="Gist token"
        autoComplete="gist-token"
      />
    </>
  );
}
