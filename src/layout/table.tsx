import React from "react";
import cn from "classnames";
import { labels } from "../data";
import { visibleDataAtom, notesAtom, BioMarker } from "../atom/dataAtom";
import { useAtomValue } from "jotai";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  ColumnDef,
  RowSelectionState,
  getGroupedRowModel,
  getExpandedRowModel,
  GroupingState,
  ExpandedState,
} from "@tanstack/react-table";
import { averageCountAtom } from "../atom/averageValueAtom";

interface TableProps {
  showOrigColumns: boolean;
  selected: string[];
  onSelect: (name: string) => void;
  showRecords: number;
}

type DisplayedEntry = {
  name: string;
  values: number[];
  unit: string;
  extra: BioMarker[3];
  tag: string;
  displayTag: string;
  sortKey: string;
};

const columnHelper = createColumnHelper<DisplayedEntry>();

function getKeyFromTime(label: string) {
  return label.slice(0, 2) + "/" + label.slice(2, 4);
}

const columns: ColumnDef<DisplayedEntry, any>[] = [
  columnHelper.accessor("selection" as any, {
    header: "",
  }),
  columnHelper.accessor("tag" as any, {
    header: "Tag",
    getGroupingValue: (row) => row.tag,
  }),
  columnHelper.accessor("name" as any, {
    header: "Name",
    footer: "Supp",
  }),
  ...labels.map((label, index) =>
    columnHelper.accessor(label as any, {
      header: getKeyFromTime(label),
      meta: {
        isRecord: true,
        isLatest: index === labels.length - 1,
        title: label,
      },
    })
  ),
  columnHelper.accessor("placeholder" as any, {
    header: "",
    meta: {
      placehoder: true,
    },
  }),
  columnHelper.accessor("range" as any, {
    header: "Range",
    meta: {
      ref: true,
      align: "center",
    },
  }),
  columnHelper.accessor("unit" as any, {
    header: "Unit",
    meta: {
      ref: true,
    },
  }),
  columnHelper.accessor("origUnit" as any, {
    header: "Orig Unit",
    meta: {
      ref: true,
    },
  }),
];

export default React.memo(
  ({ showOrigColumns, selected, onSelect, showRecords }: TableProps) => {
    const convertedEntries = useAtomValue(visibleDataAtom);
    const averageCountValue = useAtomValue(averageCountAtom);
    const notes = useAtomValue(notesAtom);

    const onCellClick = React.useCallback(async (e: React.MouseEvent<HTMLElement>) => {
      await navigator.clipboard.writeText((e.target as HTMLElement).textContent || "");
    }, []);

    const displayedEntries: DisplayedEntry[] = React.useMemo(() => {
      return convertedEntries
        .filter(([_, values]) => !showRecords || (values && values.length > 0 && values[values.length - 1] !== null && values[values.length - 1] !== undefined))
        .flatMap(([name, values, unit, extra]) => {
          if (extra.tag && extra.tag.length > 0) {
            return extra.tag.map(tag => {
              const displayTag = tag.substring(tag.indexOf('-') + 1);
              const sortKey = /^\d/.test(tag) ? `1_${tag}` : `2_${tag}`;
              return { name, values, unit, extra, tag, displayTag, sortKey };
            });
          }
          return [{ name, values, unit, extra, tag: 'Uncategorized', displayTag: 'Uncategorized', sortKey: '3_Uncategorized' }];
        })
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [convertedEntries, showRecords]);

    const columnState = React.useMemo(() => {
      let state: Record<string, boolean> = { tag: false };

      if (showRecords) {
        state = {
          ...state,
          ...Object.fromEntries(
            labels
              .filter((_, index) => index < labels.length - showRecords)
              .map((label) => [label, false])
          ),
        };
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

    const [grouping, setGrouping] = React.useState<GroupingState>(['tag']);
    const [expanded, setExpanded] = React.useState<ExpandedState>(true);

    const table = useReactTable({
      data: displayedEntries,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      enableRowSelection: true,
      onGroupingChange: setGrouping,
      onExpandedChange: setExpanded,
      groupedColumnMode: false,
      onRowSelectionChange: (updater) => {
        const newState = typeof updater === 'function' ? updater(rowSelection) : updater;
        const selectedRow = Object.keys(newState)[0];
        if (selectedRow) {
          onSelect(selectedRow);
        }
      },
      state: {
        columnVisibility: columnState,
        rowSelection,
        grouping,
        expanded,
      },
      getRowId: (originalRow) => originalRow.name + originalRow.tag,
    });

    // console.log(table.getRowModel());
    // console.log(selected, rowSelection);
    console.log(table.getFooterGroups());

    return (
      <React.Suspense fallback="Loading...">
        <table className="table table-dark table-striped table-bordered table-sm table-hover">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    title={notes[(header.column.columnDef.meta as any)?.title as string]?.items?.join(
                      "\n"
                    )}
                    className={cn({
                      "text-end": (header.column.columnDef.meta as any)?.isRecord,
                      "text-center": (header.column.columnDef.meta as any)?.align === "center",
                      "is-latest": (header.column.columnDef.meta as any)?.isLatest,
                      "sticky-left": header.id === "name",
                      "col-ref": (header.column.columnDef.meta as any)?.ref,
                      "w-25": (header.column.columnDef.meta as any)?.placehoder,
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
              .rows.map((row) => {
                if (row.getIsGrouped()) {
                  return (
                    <tr key={row.id}>
                      <td colSpan={columns.length}>
                        <button
                          {...{
                            onClick: row.getToggleExpandedHandler(),
                            style: {
                              cursor: row.getCanExpand()
                                ? "pointer"
                                : "normal",
                            },
                          }}
                        >
                          {row.getIsExpanded() ? "👇" : "👉"}{" "}
                          {row.original.displayTag} ({row.subRows.length})
                        </button>
                      </td>
                    </tr>
                  );
                }

                const { name, values, unit, extra } = row.original;
                return (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="checkbox"
                        style={{ height: 20, width: 20 }}
                        name={name}
                        onChange={() => onSelect(name)}
                        checked={selected.includes(name)}
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
                            key={index}
                            onClick={onCellClick}
                          >
                            {(unit as any)?.url ? (
                              <a
                                href={(unit as any).url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {value}
                              </a>
                            ) : (
                              value
                            )}
                          </td>
                        ))}
                    <td>
                      {averageCountValue
                        ? extra.getSamples(+averageCountValue)
                        .join(", ")
                        : null}
                    </td>
                    {showOrigColumns &&
                      extra.hasOrigin &&
                      extra.originValues?.map((value: any, index: number) => (
                        <td key={index}>{value}</td>
                      ))}
                    <td className="text-nowrap col-ref text-center">
                      {extra.range as any}
                    </td>
                    <td className="col-ref">{unit as any}</td>
                    {showOrigColumns && extra.hasOrigin && (
                      <td className="col-ref">{extra.originUnit}</td>
                    )}
                  </tr>
                );
              })}
          </tbody>
          <tfoot>
            {table.getFooterGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    title={notes[(header.column.columnDef.meta as any)?.title as string]?.supps?.join(
                      "\n"
                    )}
                    className={cn("text-center", {
                      "is-latest": (header.column.columnDef.meta as any)?.isLatest,
                      "sticky-left": header.id === "name",
                      "w-25": (header.column.columnDef.meta as any)?.placehoder,
                    })}
                  >
                    {notes[(header.column.columnDef.meta as any)?.title as string]?.supps ? "?" : null}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>
      </React.Suspense>
    );
  }
);
