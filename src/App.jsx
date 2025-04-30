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
} from "./atom/dataAtom";

export default function App() {
  const data = useAtomValue(getBioMarkersAtom);
  const [selected, setSelect] = React.useState([]);
  const [filterText, setFilterText] = useAtom(filterTextAtom);
  const [filterTag, setFilterTag] = useAtom(tagAtom);
  const [aiKey, setAiKey] = useAtom(aiKeyAtom);
  const [showOrigColumns, setShowOrigColumns] = React.useState(false);
  const [showRecords, setShowRecords] = React.useState(5);
  const [chartKeys, setChartKeys] = React.useState(null);
  const [comparedSourceTarget, setSourceTarget] = React.useState(null);
  const [corrlationKey, setCorrelationKey] = React.useState(null);
  const onTextChange = React.useCallback(
    (e) => React.startTransition(() => setFilterText(e.target.value)),
    []
  );

  const onOriginValueToggle = React.useCallback(
    (e) => setShowOrigColumns(e.target.checked),
    []
  );

  const onShowRecordsChange = React.useCallback(
    (e) => setShowRecords(+e.target.value),
    []
  );

  const onAiKeyChange = React.useCallback((e) => setAiKey(e.target.value), []);

  const onFilterByTag = React.useCallback((e) => {
    React.startTransition(() => {
      setFilterTag(e.target.dataset.tag);
      setFilterText("");
      setCorrelationKey(null);
      setSelect([]);
      setSourceTarget(null);
    });
    setShowOrigColumns(false);
  }, []);

  const onSelect = React.useCallback(
    (e) => {
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
      });
    },
    [selected, chartKeys]
  );

  const onVisualize = React.useCallback(() => {
    setChartKeys((keys) => (!keys ? selected : null));
  }, [selected]);

  const onPValue = React.useCallback(() => {
    let sourceTarget = data.filter(([name]) => selected.includes(name));
    sourceTarget = selected.map((name) =>
      sourceTarget.find((i) => i[0] === name)
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
        value={aiKey}
        onChange={onAiKeyChange}
        id="gemini-key"
        placeholder="Gemini key"
        autoComplete="gemini-key"
      />
    </>
  );
}
