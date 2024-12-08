import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./styles.css";
import Nav from "./layout/nav";
import Table from "./layout/table";
import Chart from "./layout/chart2";
import PValue from "./layout/pValue";
import Correlation from "./layout/correlation";
import { useAtomValue, useAtom } from "jotai";
import { getDataAtom, filterTextAtom, tagAtom } from "./atom/dataAtom";

export default function App() {
  const data = useAtomValue(getDataAtom);
  const [selected, setSelect] = React.useState([]);
  const [filterText, setFilterText] = useAtom(filterTextAtom);
  const [filterTag, setFilterTag] = useAtom(tagAtom);
  const [showOrigColumns, setShowOrigColumns] = React.useState(false);
  const [showLast5Records, setShowLast5Records] = React.useState(true);
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

  const onShowLast5RecordsToggle = React.useCallback(
    (e) => setShowLast5Records(e.target.checked),
    []
  );

  const onFilterByTag = React.useCallback((e) => {
    React.startTransition(() => {
      setFilterTag(e.target.dataset.tag);
      setFilterText("");
    });
    setShowOrigColumns(false);
  }, []);

  const onSelect = React.useCallback(
    (e) => {
      const value = e.target.name;
      let values = selected;
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
    filterText,
    filterTag,
    showOrigColumns,
    showLast5Records,
    onTextChange,
    onFilterByTag,
    onOriginValueToggle,
    onShowLast5RecordsToggle,
    onVisualize,
    onPValue,
    onCorrelation,
  };

  const tableProps = { showOrigColumns, selected, onSelect, showLast5Records };

  return (
    <>
      <Nav {...navProps} />
      <PValue comparedSourceTarget={comparedSourceTarget} />
      <Correlation target={corrlationKey} />
      {!!chartKeys && <Chart data={data} keys={chartKeys} />}
      <Table {...tableProps} />
    </>
  );
}
