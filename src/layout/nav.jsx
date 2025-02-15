import React from "react";
import cn from "classnames";
import Offcanvas from "react-bootstrap/Offcanvas";
import { tags } from "../processors";
import { askBioMarkers } from "../service/askAI";
import { useAtomValue } from "jotai";
import { visibleDataAtom, aiKeyAtom } from "../atom/dataAtom";

export default React.memo(
  ({
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
  }) => {
    const key = useAtomValue(aiKeyAtom);
    const data = useAtomValue(visibleDataAtom);
    const [show, setShow] = React.useState(false);
    const onToggle = () => setShow((v) => !v);

    const onAskAI = React.useCallback(
      async (e) => {
        if (selected.length === 0) {
          return;
        }
        e.target.disabled = true;

        try {
          const pairs = data
            .filter(([key]) => selected.includes(key))
            .map(
              ([key, values, unit]) =>
                `${key} ${values[values.length - 1]} ${unit || ""}`
            );
          const text = await askBioMarkers(pairs, key);
          setCanvasText(text);
          // console.log(text);
        } catch (err) {
          console.error(err);
          alert(err);
        } finally {
          e.target.disabled = false;
        }
      },
      [selected, data]
    );

    const [canvasText, setCanvasText] = React.useState(null);

    const handleClose = React.useCallback(() => setCanvasText(null), []);

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
              {tags.map((tag) => (
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
          {selected.length == 2 && (
            <button
              type="button"
              className="btn btn-sm btn-primary px-4"
              onClick={onVisualize}
            >
              Visualize
            </button>
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
              onClick={onSelect}
              className="btn btn-outline-warning btn-sm"
            >
              {item}
            </button>
          ))}
          <div className="ms-auto d-flex flex-row gap-4">
            <div className="form-check form-switch">
              <select
                className="form-select"
                value={showRecords.toString()}
                onChange={onShowRecordsChange}
              >
                <option value="0">All</option>
                <option value="10">Last 10 records</option>
                <option value="5">Last 5 records</option>
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
            {canvasText}
          </Offcanvas.Body>
        </Offcanvas>
      </nav>
    );
  }
);
