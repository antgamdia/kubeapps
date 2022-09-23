// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CellContext, ColumnDef, createColumnHelper } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { DeploymentEvent, IBasicFormParam2 } from "shared/types";
import "./BasicDeploymentForm.css";
import TabularSchemaEditorTable from "./TabularSchemaEditorTable/TabularSchemaEditorTable";
import { fuzzySort } from "./TabularSchemaEditorTable/TabularSchemaEditorTableHelpers";
import {
  renderConfigCurrentValuePro,
  renderConfigDefaultValue,
  renderConfigDeployedValue,
  renderConfigDescription,
  renderConfigKey,
  renderConfigKeyHeader,
  renderConfigType,
} from "./TabularSchemaEditorTable/TabularSchemaEditorTableRenderer";

export interface IBasicDeploymentFormProps {
  handleBasicFormParamChange: (
    p: IBasicFormParam2,
  ) => (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  deploymentEvent: DeploymentEvent;
  paramsFromComponentState: IBasicFormParam2[];
  isLoading: boolean;
  saveAllChanges: () => void;
}

function BasicDeploymentForm(props: IBasicDeploymentFormProps) {
  // Fetch data from the parent component
  const {
    handleBasicFormParamChange,
    saveAllChanges,
    deploymentEvent,
    paramsFromComponentState,
    isLoading,
  } = props;

  // Component state
  const [globalFilter, setGlobalFilter] = useState("");

  // Column definitions
  // use useMemo to avoid re-creating the columns on every render
  const columnHelper = createColumnHelper<IBasicFormParam2>();
  const columns = useMemo<ColumnDef<IBasicFormParam2>[]>(() => {
    const cols = [
      columnHelper.accessor((row: IBasicFormParam2) => row.key, {
        id: "key",
        cell: (info: CellContext<IBasicFormParam2, any>) =>
          renderConfigKey(info.row.original, info.row, saveAllChanges),
        header: info => renderConfigKeyHeader(info.table, saveAllChanges),
        sortingFn: fuzzySort,
      }),
      columnHelper.accessor((row: IBasicFormParam2) => row.type, {
        id: "type",
        cell: (info: CellContext<IBasicFormParam2, any>) => renderConfigType(info.row.original),
        header: () => <span>Type</span>,
      }),
      columnHelper.accessor((row: IBasicFormParam2) => row.description, {
        id: "description",
        cell: (info: CellContext<IBasicFormParam2, any>) =>
          renderConfigDescription(info.row.original),
        header: () => <span>Description</span>,
      }),
      columnHelper.accessor((row: IBasicFormParam2) => row.defaultValue, {
        id: "defaultValue",
        cell: (info: CellContext<IBasicFormParam2, any>) =>
          renderConfigDefaultValue(info.row.original),
        header: () => <span>Default Value</span>,
      }),
      columnHelper.accessor((row: IBasicFormParam2) => row.currentValue, {
        id: "currentValue",
        cell: (info: CellContext<IBasicFormParam2, any>) => {
          return renderConfigCurrentValuePro(info.row.original, handleBasicFormParamChange);
        },
        header: () => <span>Current Value</span>,
      }),
    ];
    if (deploymentEvent === "upgrade") {
      cols.splice(
        4,
        0,
        columnHelper.accessor((row: IBasicFormParam2) => row.deployedValue, {
          id: "deployedValue",
          cell: (info: CellContext<IBasicFormParam2, any>) =>
            renderConfigDeployedValue(info.row.original),
          header: () => <span>Deployed Value</span>,
        }),
      );
    }
    return cols;
  }, [columnHelper, deploymentEvent, handleBasicFormParamChange, saveAllChanges]);

  return (
    <TabularSchemaEditorTable
      columns={columns}
      data={paramsFromComponentState}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
      isLoading={isLoading}
      saveAllChanges={saveAllChanges}
    />
  );
}

export default BasicDeploymentForm;
