// Copyright 2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import {
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Key, useState } from "react";
import DebouncedInput from "./DebouncedInput";
import { fuzzyFilter } from "./TableHelpers";

export interface TabularSchemaEditorTableProps {
  columns: any;
  data: any;
  globalFilter: any;
  setGlobalFilter: any;
}

export default function TabularSchemaEditorTable(props: TabularSchemaEditorTableProps) {
  const { columns, data, globalFilter, setGlobalFilter } = props;

  // Component state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
      expanded,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),

    onExpandedChange: setExpanded,
    getSubRows: row => row.properties,
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
  });

  return (
    <>
      <div className="p-2">
        <div>
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={value => setGlobalFilter(String(value))}
            className="p-2 font-lg shadow border border-block"
            placeholder="Search all columns..."
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="border rounded p-1"
            onClick={e => {
              e.preventDefault();
              table.setPageIndex(0);
            }}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={e => {
              e.preventDefault();
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={e => {
              e.preventDefault();
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="border rounded p-1"
            onClick={e => {
              e.preventDefault();
              table.setPageIndex(table.getPageCount() - 1);
            }}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            | Go to page:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                e.preventDefault();
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 rounded w-16"
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <table className="table table-valign-center">
          <thead>
            {table
              .getHeaderGroups()
              .map((headerGroup: { id: Key | null | undefined; headers: any[] }) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header: {
                      id: Key | null | undefined;
                      isPlaceholder: any;
                      column: { columnDef: { header: any } };
                      getContext: () => any;
                    }) => (
                      <th key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ),
                  )}
                </tr>
              ))}
          </thead>
          <tbody>
            {table
              .getRowModel()
              .rows.map((row: { id: Key | null | undefined; getVisibleCells: () => any[] }) => (
                <tr key={row.id}>
                  {row
                    .getVisibleCells()
                    .map(
                      (cell: {
                        id: Key | null | undefined;
                        column: { columnDef: { cell: any } };
                        getContext: () => any;
                      }) => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ),
                    )}
                </tr>
              ))}
          </tbody>
          <tfoot>
            {table
              .getFooterGroups()
              .map((footerGroup: { id: Key | null | undefined; headers: any[] }) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map(
                    (header: {
                      id: Key | null | undefined;
                      isPlaceholder: any;
                      column: { columnDef: { footer: any } };
                      getContext: () => any;
                    }) => (
                      <th key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.footer, header.getContext())}
                      </th>
                    ),
                  )}
                </tr>
              ))}
          </tfoot>
        </table>
        <div className="h-2" />
        <div className="flex items-center gap-2">
          <button
            className="border rounded p-1"
            onClick={e => {
              e.preventDefault();
              table.setPageIndex(0);
            }}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={e => {
              e.preventDefault();
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={e => {
              e.preventDefault();
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="border rounded p-1"
            onClick={e => {
              e.preventDefault();
              table.setPageIndex(table.getPageCount() - 1);
            }}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            | Go to page:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                e.preventDefault();
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 rounded w-16"
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="h-4" />
      </div>
    </>
  );
}
