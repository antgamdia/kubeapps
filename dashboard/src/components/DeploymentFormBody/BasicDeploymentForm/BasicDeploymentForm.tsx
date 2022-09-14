// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CellContext, ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { DeploymentEvent, IBasicFormParam } from "shared/types";
import "./BasicDeploymentForm.css";
import { fuzzySort } from "./TabularSchemaEditorTable/TableHelpers";
import TabularSchemaEditorTable from "./TabularSchemaEditorTable/TabularSchemaEditorTable";
import {
  renderConfigCurrentValuePro,
  renderConfigDefaultValue,
  renderConfigDeployedValue,
  renderConfigDescription,
  renderConfigKey,
  renderConfigKeyHeader,
  renderConfigType,
} from "./TabularSchemaEditorTable/tempRenderers";
import { IBasicFormParam2 } from "./TabularSchemaEditorTable/tempType";

export interface IBasicDeploymentFormProps {
  handleValuesChange: (value: string) => void;
  handleBasicFormParamChange: (
    p: IBasicFormParam2,
  ) => (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  deploymentEvent: DeploymentEvent;
  paramsFromComponentState: IBasicFormParam[];
  // new
  schemaFromTheAvailablePackage: any;
  valuesFromTheAvailablePackageNodes: any;
  valuesFromTheDeployedPackage: any;
  valuesFromTheParentContainer: any;
}

function BasicDeploymentForm(props: IBasicDeploymentFormProps) {
  // Fetch data from the parent component
  const {
    handleValuesChange,
    handleBasicFormParamChange,
    deploymentEvent,
    paramsFromComponentState,
    schemaFromTheAvailablePackage,
    valuesFromTheAvailablePackageNodes,
    valuesFromTheDeployedPackage,
    valuesFromTheParentContainer,
  } = props;

  // Component state
  const [globalFilter, setGlobalFilter] = useState("");
  // const [paramsFromComponentState, setParamsFromComponentState] = useState(
  // [] as IBasicFormParam2[],
  // );

  useEffect(() => {
    console.log(paramsFromComponentState);
  }, [paramsFromComponentState]);

  // Column definitions
  // use useMemo to avoid re-creating the columns on every render
  const columnHelper = createColumnHelper<IBasicFormParam2>();
  const columns = useMemo<ColumnDef<IBasicFormParam2>[]>(() => {
    return [
      // const columns = [
      columnHelper.accessor((row: IBasicFormParam2) => row.key, {
        id: "key",
        cell: (info: CellContext<IBasicFormParam2, any>) =>
          renderConfigKey(info.row.original, info.row),
        header: info => renderConfigKeyHeader(info.table),
        // filterFn: "fuzzy",
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
      columnHelper.accessor((row: IBasicFormParam2) => row.deployedValue, {
        id: "deployedValue",
        cell: (info: CellContext<IBasicFormParam2, any>) =>
          renderConfigDeployedValue(info.row.original),
        header: () => <span>Deployed Value</span>,
      }),
      columnHelper.accessor((row: IBasicFormParam2) => row.currentValue, {
        id: "currentValue",
        cell: (info: CellContext<IBasicFormParam2, any>) =>
          renderConfigCurrentValuePro(info.row.original, handleBasicFormParamChange),
        header: () => <span>Current Value</span>,
      }),
    ];
  }, [columnHelper, handleBasicFormParamChange]);

  // useEffects

  // initialize params
  // useEffect(() => {
  //   console.log("basicdeploymentform.tsx useEffect 1");
  //   const initialParamsFromContainer = extractParamsFromSchema(
  //     valuesFromTheAvailablePackageNodes,
  //     schemaFromTheAvailablePackage,
  //     deploymentEvent,
  //   );
  //   setParamsFromComponentState(initialParamsFromContainer);
  // }, [deploymentEvent, schemaFromTheAvailablePackage, valuesFromTheAvailablePackageNodes]);

  return (
    <TabularSchemaEditorTable
      columns={columns}
      data={paramsFromComponentState}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
    />
  );
}

export default BasicDeploymentForm;
