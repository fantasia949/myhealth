import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./styles.css";
import Nav from "./layout/nav";
import Table from "./layout/table";
import Chart from "./layout/chart2";
import PValue from "./layout/pValue";
import Correlation from "./layout/correlation";
import { useAtomValue, useAtom } from "jotai";
import {
  getBioMarkersAtom,
  filterTextAtom,
  tagAtom,
  aiKeyAtom,
  BioMarker,
} from "./atom/dataAtom";

export default function App() {
  const data = useAtomValue(getBioMarkersAtom);
  const [selected, setSelect] = React.useState<string[]>([]);
  const [filterText, setFilterText] = useAtom(filterTextAtom);
  const [filterTag, setFilterTag] = useAtom(tagAtom);
  const [aiKey, setAiKey] = useAtom(aiKeyAtom);
  const [showOrigColumns, setShowOrigColumns] = React.useState<boolean>(false);
  const [showRecords, setShowRecords] = React.useState<number>(5);
  const [chartKeys, setChartKeys] = React.useState<string[] | null>(null);
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // debugger;
      let values = selected;

      const value = e.target.name;
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
    let sourceTarget: BioMarker[] = data.filter(([name]) =>
      selected.includes(name)
    );
    sourceTarget = selected.map(
      (name) => sourceTarget.find((i) => i[0] === name) as BioMarker
    );
    setSourceTarget((v) => {
      if (v && sourceTarget[0] === v[0] && sourceTarget[1] === v[1]) {
        return null;
      }
      return sourceTarget;
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

  const navProps = {
    selected,
    onSelect,
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
      {chartKeys?.length === 2 && <Chart data={data} keys={chartKeys} />}
      <Table {...tableProps} />
      <input
        className="field"
        name="key"
        value={aiKey as string}
        onChange={onAiKeyChange}
        id="gemini-key"
        placeholder="Gemini key"
        autoComplete="gemini-key"
      />
    </>
  );
}
