import React from "react";
import cn from "classnames";
import { tags } from "../processors";

export default React.memo(
  ({
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
  }) => {
    const [show, setShow] = React.useState(false);
    const onToggle = () => setShow((v) => !v);
    return (
      <nav className="navbar navbar-expand-lg sticky-top sticky-left bg-body-tertiary gap-3">
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
            <ul className="navbar-nav col-6 gap-2 align-items-start">
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
          <div className="ms-auto d-flex flex-row gap-4">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={showLast5Records}
                onChange={onShowLast5RecordsToggle}
                id="lastFiveRecords"
              />
              <label className="form-check-label" htmlFor="lastFiveRecords">
                Last 5 records
              </label>
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
      </nav>
    );
  }
);
