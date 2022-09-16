// Copyright 2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsButton } from "@cds/react/button";
import { CdsSelect } from "@cds/react/select";
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
import { IBasicFormParam2 } from "./tempType";

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
  const [globalExpanded, setGlobalExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
      expanded: globalExpanded,
    },
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getSubRows: (row: IBasicFormParam2) => row.params,
    globalFilterFn: fuzzyFilter,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setGlobalExpanded,
    onGlobalFilterChange: setGlobalFilter,
    debugTable: true,
  });

  const paginationButtons = (
    <>
      <div style={{ marginTop: "1em" }}>
        <CdsButton
          style={{ marginRight: "0.5em" }}
          action="solid"
          status="primary"
          type="button"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </CdsButton>
        <CdsButton
          style={{ marginRight: "0.5em" }}
          action="solid"
          status="primary"
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </CdsButton>

        <CdsButton action="flat" type="button" status="neutral" style={{ marginRight: "0.5em" }}>
          <span>
            Page{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>
        </CdsButton>
        <CdsButton
          style={{ marginRight: "0.5em" }}
          action="solid"
          status="primary"
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </CdsButton>
        <CdsButton
          action="solid"
          status="primary"
          type="button"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </CdsButton>
      </div>
    </>
  );

  const topButtons = (
    <>
      <div style={{ marginTop: "1em" }}>
        <DebouncedInput
          title="Param search"
          value={globalFilter ?? ""}
          onChange={value => setGlobalFilter(String(value))}
          placeholder="Type anything to search in all columns..."
        />
      </div>
      {paginationButtons}
    </>
  );
  const bottomButtons = (
    <>
      {paginationButtons}

      <CdsSelect>
        <label htmlFor="page-size">Page size</label>
        <select
          id="page-size"
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
      </CdsSelect>
    </>
  );

  const tableHeader = table
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
    ));

  const tableBody = table
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
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ),
          )}
      </tr>
    ));

  const tableFooter = table
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
    ));

  const tableObject = (
    <>
      <table className="table table-valign-center">
        <thead>{tableHeader}</thead>
        <tbody>{tableBody}</tbody>
        <tfoot>{tableFooter}</tfoot>
      </table>
    </>
  );

  return (
    <>
      {topButtons}
      {tableObject}
      {bottomButtons}
    </>
  );
}
