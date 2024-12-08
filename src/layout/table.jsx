import React from "react";
import cn from "classnames";
import { labels } from "../data";
import { visibleDataAtom } from "../atom/dataAtom";
import { useAtomValue } from "jotai";

export default React.memo(
  ({ showOrigColumns, selected, onSelect, showLast5Records }) => {
    const convertedEntries = useAtomValue(visibleDataAtom);
    const onCellClick = React.useCallback(async (e) => {
      await navigator.clipboard.writeText(e.target.textContent);
    }, []);

    const displayedEntries = React.useMemo(() => {
      return convertedEntries.filter(
        ([_, values]) => !showLast5Records || values[values.length - 1]
      );
    }, [convertedEntries, showLast5Records]);

    return (
      <React.Suspense fallback="Loading...">
        <table className="table table-dark table-striped table-bordered w-75 table-sm">
          <thead>
            <tr>
              <th></th>
              <th className="sticky-left">Name</th>
              {labels
                .filter(
                  (_, index) => !showLast5Records || index >= labels.length - 5
                )
                .map((label, index, array) => (
                  <th
                    index={index}
                    key={label}
                    className={cn({ "is-latest": array.length - 1 == index })}
                  >
                    {label}
                  </th>
                ))}
              <th className="col-ref">Range</th>
              <th className="col-ref">Unit</th>
              {showOrigColumns && <th className="col-ref">Orig Unit</th>}
            </tr>
          </thead>
          <tbody>
            {displayedEntries.map(([name, values, unit, extra]) => (
              <tr key={name}>
                <td>
                  <input
                    type="checkbox"
                    name={name}
                    onClick={onSelect}
                    value={selected.includes(name)}
                  />
                </td>
                <th
                  className="text-nowrap sticky-left"
                  title={extra.description}
                >
                  {name}
                </th>
                {(!showOrigColumns || !extra.hasOrigin) &&
                  values
                    .filter(
                      (_, index) =>
                        !showLast5Records || index >= labels.length - 5
                    )
                    .map((value, index, array) => (
                      <td
                        className={cn({
                          "v-bad": extra.isNotOptimal(value),
                          "is-latest": index === array.length - 1,
                        })}
                        index={index}
                        key={index}
                        onClick={onCellClick}
                      >
                        {unit?.url ? (
                          <a href={unit.url} targe="_blank" rel="noreferrer">
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                        {/* <span
                          className={cn("indicator", {
                            "--up": value > values[index - 1],
                            "--down": value < values[index - 1],
                          })}
                        ></span> */}
                      </td>
                    ))}
                {showOrigColumns &&
                  extra.hasOrigin &&
                  extra.originValues.map((value, index) => (
                    <td index={index}>{value}</td>
                  ))}
                <td className="text-nowrap col-ref">{extra.range}</td>
                <td className="col-ref">{unit}</td>
                {showOrigColumns && extra.hasOrigin && (
                  <td className="col-ref">{extra.originUnit}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </React.Suspense>
    );
  }
);
