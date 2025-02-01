import React from "react";
import cn from "classnames";
import { labels } from "../data";
import { visibleDataAtom } from "../atom/dataAtom";
import { useAtomValue } from "jotai";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor("selection", {
    header: "",
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  ...labels.map((label, index) =>
    columnHelper.accessor(label, {
      header: label.slice(0, 2) + "/" + label.slice(2, 4),
      isRecord: true,
      isLatest: index === labels.length - 1,
    })
  ),
  columnHelper.accessor("placeholder", {
    header: "",
    placehoder: true,
  }),
  columnHelper.accessor("range", {
    header: "Range",
    ref: true,
    align: "center",
  }),
  columnHelper.accessor("unit", {
    header: "Unit",
    ref: true,
  }),
  columnHelper.accessor("origUnit", {
    header: "Orig Unit",
    ref: true,
  }),
];

export default React.memo(
  ({ showOrigColumns, selected, onSelect, showRecords }) => {
    const convertedEntries = useAtomValue(visibleDataAtom);
    const onCellClick = React.useCallback(async (e) => {
      await navigator.clipboard.writeText(e.target.textContent);
    }, []);

    const displayedEntries = React.useMemo(() => {
      return convertedEntries
        .filter(([_, values]) => !showRecords || values[values.length - 1])
        .map(([name, values, unit, extra]) => ({ name, values, unit, extra }));
    }, [convertedEntries, showRecords]);

    const columnState = React.useMemo(() => {
      let state = {};

      if (showRecords) {
        state = Object.fromEntries(
          labels
            .filter((_, index) => index < labels.length - showRecords)
            .map((label) => [label, false])
        );
      }

      if (!showOrigColumns) {
        state.origUnit = false;
      }

      return state;
    }, [showRecords, showOrigColumns]);

    const rowSelection = React.useMemo(
      () => Object.fromEntries(selected.map((item) => [item, true])),
      [selected]
    );

    const table = useReactTable({
      data: displayedEntries,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      enableRowSelection: true,
      onRowSelectionChange: (stateFunc) => {
        onSelect({ target: { name: Object.keys(stateFunc())[0] } });
      },
      state: {
        columnVisibility: columnState,
        rowSelection,
      },
      getRowId: (originalRow) => originalRow.name,
    });

    // console.log(table.getRowModel());
    // console.log(selected, rowSelection);

    return (
      <React.Suspense fallback="Loading...">
        <table className="table table-dark table-striped table-bordered table-sm table-hover">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn({
                      "text-end": header.column.columnDef.isRecord,
                      "text-center": header.column.columnDef.align === "center",
                      "is-latest": header.column.columnDef.isLatest,
                      "sticky-left": header.id === "name",
                      "col-ref": header.column.columnDef.ref,
                      "w-25": header.column.columnDef.placehoder,
                    })}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table
              .getRowModel()
              .rows.map(
                ({
                  original: { name, values, unit, extra },
                  getToggleSelectedHandler,
                }) => (
                  <tr key={name}>
                    <td>
                      <input
                        type="checkbox"
                        style={{ height: 20, width: 20 }}
                        name={name}
                        onClick={onSelect || getToggleSelectedHandler()}
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
                            !showRecords || index >= labels.length - showRecords
                        )
                        .map((value, index, array) => (
                          <td
                            className={cn("text-end", {
                              "v-bad": extra.isNotOptimal(value),
                              "is-latest": index === array.length - 1,
                            })}
                            index={index}
                            key={index}
                            onClick={onCellClick}
                          >
                            {unit?.url ? (
                              <a
                                href={unit.url}
                                targe="_blank"
                                rel="noreferrer"
                              >
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
                    <td></td>
                    {showOrigColumns &&
                      extra.hasOrigin &&
                      extra.originValues.map((value, index) => (
                        <td index={index}>{value}</td>
                      ))}
                    <td className="text-nowrap col-ref text-center">
                      {extra.range}
                    </td>
                    <td className="col-ref">{unit}</td>
                    {showOrigColumns && extra.hasOrigin && (
                      <td className="col-ref">{extra.originUnit}</td>
                    )}
                  </tr>
                )
              )}
          </tbody>
        </table>
      </React.Suspense>
    );
  }
);
