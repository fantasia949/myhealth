import React from "react";
import cn from "classnames";
import Offcanvas from "react-bootstrap/Offcanvas";
import { tags } from "../processors";
import { askBioMarkers } from "../service/askAI";
import { useAtom, useAtomValue } from "jotai";
import { visibleDataAtom, aiKeyAtom } from "../atom/dataAtom";
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
          const text = await askBioMarkers(pairs, key, filterTag, prevPairs);
          setCanvasText(text);
          // console.log(text);
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

    const handleClose = React.useCallback(() => setCanvasText(null), []);

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
      <nav className="navbar navbar-expand-lg sticky-top sticky-left bg-body-tertiary gap-3 z-2">
        <div className="container-fluid gap-3">
          <button className="navbar-toggler" type="button" onClick={onToggle}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="col-md-2">
            <input
              type="search"
              value={filterText}
              onChange={onTextChange}
              autoFocus
              className="form-control border-0"
              placeholder="Search"
            />
          </div>
          <div className={cn("collapse navbar-collapse", { show })}>
            <ul className="navbar-nav gap-2 align-items-start">
              {tags.map((tag: string) => (
                <li className="nav-item" key={tag}>
                  <button
                    type="button"
                    data-tag={tag}
                    className={cn("nav-link", {
                      active: filterTag == tag,
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
                className="btn btn-sm bg-warning px-4"
                onClick={onFilterByTag}
              >
                Reset
              </button>
            )}
          </div>
          {selected.length > 0 && (
            <div className="d-flex gap-2">
              <select
                className="form-select"
                value={chartType}
                onChange={(e) => onChartTypeChange(e.target.value)}
              >
                <option value="scatter">Scatter Chart</option>
              </select>
              <button
                type="button"
                className="btn btn-sm btn-primary px-4"
                onClick={onVisualize}
              >
                Visualize
              </button>
            </div>
          )}
          {selected.length === 2 && (
            <button
              type="button"
              className="btn btn-sm btn-primary  px-4"
              onClick={onPValue}
            >
              P-Value
            </button>
          )}
          {selected.length === 1 && (
            <button
              type="button"
              className="btn btn-sm btn-primary px-4"
              onClick={onCorrelation}
            >
              Correlations
            </button>
          )}
          {selected.length > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-primary px-4"
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
              className="btn btn-outline-warning btn-sm"
            >
              {item}
            </button>
          ))}
          <div className="ms-auto d-flex flex-row gap-4">
            <div className="form-check form-switch">
              <select
                className="form-select"
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
            <div className="form-check form-switch">
              <select
                className="form-select"
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
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={showOrigColumns}
                onChange={onOriginValueToggle}
                id="flexSwitchCheckDefault"
              />
              <label
                className="form-check-label"
                htmlFor="flexSwitchCheckDefault"
              >
                Origin values
              </label>
            </div>
          </div>
        </div>

        <Offcanvas show={!!canvasText} onHide={handleClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Biomarker</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>
            <Markdown>{canvasText}</Markdown>
          </Offcanvas.Body>
        </Offcanvas>
      </nav>
    );
  }
);
