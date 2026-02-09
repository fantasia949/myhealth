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
  getGroupedRowModel,
  getExpandedRowModel,
  GroupingState,
  ExpandedState,
} from "@tanstack/react-table";
import { averageCountAtom } from "../atom/averageValueAtom";
import LineChart from "./LineChart";

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
  columnHelper.display({
    id: "expand",
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
        className: (() => {
          const dist = labels.length - 1 - index;
          if (dist === 0) return "";
          if (dist <= 2) return "hidden sm:table-cell";
          if (dist <= 4) return "hidden md:table-cell";
          if (dist > 4) return "hidden lg:table-cell";
        })(),
      },
    })
  ),
  columnHelper.accessor("placeholder" as any, {
    header: "",
    meta: {
      placehoder: true,
      className: "hidden lg:table-cell",
    },
  }),
  columnHelper.accessor("range" as any, {
    header: "Range",
    meta: {
      ref: true,
      align: "center",
      className: "hidden md:table-cell",
    },
  }),
  columnHelper.accessor("unit" as any, {
    header: "Unit",
    meta: {
      ref: true,
      className: "hidden sm:table-cell",
    },
  }),
  columnHelper.accessor("origUnit" as any, {
    header: "Orig Unit",
    meta: {
      ref: true,
      className: "hidden lg:table-cell",
    },
  }),
];

export default React.memo(
  ({ showOrigColumns, selected, onSelect, showRecords }: TableProps) => {
    const convertedEntries = useAtomValue(visibleDataAtom);
    const averageCountValue = useAtomValue(averageCountAtom);
    const notes = useAtomValue(notesAtom);
    const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);

    const onCellClick = React.useCallback(async (e: React.MouseEvent<HTMLElement>) => {
      await navigator.clipboard.writeText((e.target as HTMLElement).textContent || "");
    }, []);

    const toggleExpand = React.useCallback((id: string) => {
      setExpandedRowId((prev) => (prev === id ? null : id));
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
      autoResetExpanded: false,
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

    return (
      <React.Suspense fallback="Loading...">
        <table className="w-full text-sm text-left border-collapse bg-dark-table-row text-dark-text">
          <thead className="sticky top-[39px] z-10 bg-dark-table-header">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    title={notes[(header.column.columnDef.meta as any)?.title as string]?.items?.join(
                      "\n"
                    )}
                    className={cn("p-2 border border-gray-700 relative whitespace-nowrap", {
                      "text-right": (header.column.columnDef.meta as any)?.isRecord,
                      "text-center": (header.column.columnDef.meta as any)?.align === "center",
                      "is-latest": (header.column.columnDef.meta as any)?.isLatest,
                      "sticky-left bg-dark-table-header": header.id === "name",
                      "w-1/4": (header.column.columnDef.meta as any)?.placehoder,
                    }, (header.column.columnDef.meta as any)?.className)}
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
                    <tr key={row.id} className="bg-dark-accent font-bold">
                      <td colSpan={columns.length} className="p-2 border border-gray-700">
                        <button
                          {...{
                            onClick: row.getToggleExpandedHandler(),
                            style: {
                              cursor: row.getCanExpand()
                                ? "pointer"
                                : "normal",
                            },
                          }}
                          className="flex items-center gap-2 w-full text-left"
                        >
                          {row.getIsExpanded() ? "👇" : "👉"}{" "}
                          {row.original.displayTag} ({row.subRows.length})
                        </button>
                      </td>
                    </tr>
                  );
                }

                const { name, values, unit, extra } = row.original;
                const isExpanded = expandedRowId === row.id;

                return (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-gray-700 odd:bg-dark-accent border-b border-gray-700">
                      <td className="p-2 border border-gray-700 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          name={name}
                          aria-label={`Select ${name}`}
                          onChange={() => onSelect(name)}
                          checked={selected.includes(name)}

                        />
                      </td>
                      <td className="p-2 border border-gray-700 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => toggleExpand(row.id)}
                          title="Toggle Chart"
                          className="block w-full text-xl hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          aria-label={isExpanded ? "Collapse chart" : "Expand chart"}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? "➖" : "📈"}
                        </button>
                      </td>
                      <th
                        className="p-2 border border-gray-700 whitespace-nowrap sticky-left bg-dark-table-row"
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
                              className={cn("p-2 border border-gray-700 text-right cursor-pointer relative", {
                                "v-bad": extra.isNotOptimal(value),
                                "is-latest": index === array.length - 1,
                                "hidden sm:table-cell": array.length - 1 - index <= 2 && array.length - 1 - index > 0,
                                "hidden md:table-cell": array.length - 1 - index <= 4 && array.length - 1 - index > 2,
                                "hidden lg:table-cell": array.length - 1 - index > 4,
                              })}
                              key={index}
                              onClick={onCellClick}
                            >
                              {(unit as any)?.url ? (
                                <a
                                  href={(unit as any).url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  {value}
                                </a>
                              ) : (
                                value
                              )}
                            </td>
                          ))}
                      <td className="p-2 border border-gray-700 hidden lg:table-cell">
                        {averageCountValue
                          ? extra.getSamples(+averageCountValue)
                          .join(", ")
                          : null}
                      </td>
                      {showOrigColumns &&
                        extra.hasOrigin &&
                        extra.originValues?.map((value: any, index: number) => (
                          <td key={index} className="p-2 border border-gray-700">{value}</td>
                        ))}
                      <td className="p-2 border border-gray-700 whitespace-nowrap text-center hidden md:table-cell">
                        {extra.range as any}
                      </td>
                      <td className="p-2 border border-gray-700 hidden sm:table-cell">{unit as any}</td>
                      {showOrigColumns && extra.hasOrigin && (
                        <td className="p-2 border border-gray-700 hidden lg:table-cell">{extra.originUnit}</td>
                      )}
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-800">
                        <td colSpan={table.getVisibleLeafColumns().length} className="border border-gray-700">
                          <div className="p-3">
                             <LineChart name={name} values={values} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
                    className={cn("p-2 border border-gray-700 text-center relative", {
                      "is-latest": (header.column.columnDef.meta as any)?.isLatest,
                      "sticky-left bg-dark-table-row": header.id === "name",
                      "w-1/4": (header.column.columnDef.meta as any)?.placehoder,
                    }, (header.column.columnDef.meta as any)?.className)}
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
