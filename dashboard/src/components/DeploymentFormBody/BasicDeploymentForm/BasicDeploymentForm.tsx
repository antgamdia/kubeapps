// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsButton } from "@cds/react/button";
import { CdsIcon } from "@cds/react/icon";
import { CellContext, createColumnHelper } from "@tanstack/react-table";
import { FormEvent, useEffect, useState } from "react";
import { DeploymentEvent, IBasicFormParam } from "shared/types";
import "./BasicDeploymentForm.css";
import BooleanParam2 from "./BooleanParam2";
import IndeterminateCheckbox from "./TabularSchemaEditorTable/IndeterminateCheckbox";
import { fuzzySort } from "./TabularSchemaEditorTable/TableHelpers";
import TabularSchemaEditorTable from "./TabularSchemaEditorTable/TabularSchemaEditorTable";
import { extractParamsFromSchema } from "./TabularSchemaEditorTable/tempSchema";
import { IBasicFormParam2 } from "./TabularSchemaEditorTable/tempType";

export interface IBasicDeploymentFormProps {
  deploymentEvent: DeploymentEvent;
  params: IBasicFormParam[];
  handleBasicFormParamChange: (
    p: IBasicFormParam,
  ) => (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleValuesChange: (value: string) => void;
  appValues: string;

  // new
  schemaFromTheAvailablePackage: any;
  valuesFromTheAvailablePackageNodes: any;
}

function BasicDeploymentForm(props: IBasicDeploymentFormProps) {
  // Fetch data from the parent component
  const { schemaFromTheAvailablePackage, deploymentEvent, valuesFromTheAvailablePackageNodes } =
    props;

  // Component state
  const [globalFilter, setGlobalFilter] = useState("");
  const [paramsFromComponentState, setParamsFromComponentState] = useState(
    [] as IBasicFormParam2[],
  );

  // Column definitions
  // use useMemo to avoid re-creating the columns on every render
  const columnHelper = createColumnHelper<IBasicFormParam2>();
  // const columns = useMemo<ColumnDef<IBasicFormParam2>[]>(() => {
  //   return [
  const columns = [
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
        renderConfigCurrentValuePro(info.row.original),
      header: () => <span>Current Value</span>,
    }),
  ];
  // }, []);

  // useEffects

  // initialize params
  useEffect(() => {
    const initialParamsFromContainer = extractParamsFromSchema(
      valuesFromTheAvailablePackageNodes,
      schemaFromTheAvailablePackage,
      deploymentEvent,
    );
    setParamsFromComponentState(initialParamsFromContainer);
  }, []);

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

/// DELETE FROM HERE
export function renderConfigKeyHeader(table: any) {
  return (
    <>
      <CdsButton
        type="button"
        onClick={table.getToggleAllRowsExpandedHandler()}
        action="flat"
        status="primary"
      >
        {table.getIsAllRowsExpanded() ? (
          <CdsIcon shape="eye-hide" size="sm" solid={true} />
        ) : (
          <CdsIcon shape="eye" size="sm" solid={true} />
        )}
      </CdsButton>
      Key
    </>
  );
}

export function renderConfigKey(value: IBasicFormParam2, row: any) {
  return (
    <div
      style={{
        // Since rows are flattened by default,
        // we can use the row.depth property
        // and paddingLeft to visually indicate the depth
        // of the row
        paddingLeft: `${row.depth * 2}rem`,
        textAlign: "left",
      }}
    >
      <>
        {row.getCanExpand() ? (
          <CdsButton
            type="button"
            onClick={row.getToggleExpandedHandler()}
            action="flat"
            status="primary"
            size="sm"
          >
            {row.getIsExpanded() ? (
              <CdsIcon shape="eye-hide" size="sm" solid={true} />
            ) : (
              <CdsIcon shape="eye" size="sm" solid={true} />
            )}
          </CdsButton>
        ) : (
          ""
        )}
        <br />
        {value.key}
      </>
    </div>
  );
}
export function renderConfigType(value: IBasicFormParam2) {
  return <span className={value.hasProperties ? "headerRow" : ""}>{value?.type}</span>;
}

export function renderConfigDescription(value: IBasicFormParam2) {
  const maxLength = 55;
  return value?.description?.length > maxLength ? (
    // TODO: Add a tooltip to show the full description
    <span className={value?.hasProperties ? "headerRow" : ""}>
      {value?.description.slice(0, maxLength - 1)}
    </span>
  ) : (
    <span className={value?.hasProperties ? "headerRow" : ""}>{value?.description}</span>
  );
}

export function renderConfigDefaultValue(value: IBasicFormParam2) {
  if (!value.hasProperties) {
    // TODO(agamez): add custom input for objects an arrays
    return value?.type === "object" || value?.type === "array" ? (
      <span className={value?.hasProperties ? "headerRow" : ""}>
        {JSON.stringify(value?.defaultValue)}
      </span>
    ) : (
      <span className={value?.hasProperties ? "headerRow" : ""}>{value?.defaultValue}</span>
    );
  } else {
    return <></>;
  }
}

export function renderConfigDeployedValue(value: IBasicFormParam2) {
  if (!value.hasProperties) {
    // TODO(agamez): add custom input for objects an arrays
    return value?.type === "object" || value?.type === "array" ? (
      <span className={value?.hasProperties ? "headerRow" : ""}>
        {JSON.stringify(value?.deployedValue)}
      </span>
    ) : (
      <span className={value?.hasProperties ? "headerRow" : ""}>
        {JSON.stringify(value?.deployedValue)}
      </span>
    );
  } else {
    return <></>;
  }
}

export function renderConfigCurrentValuePro(
  value: IBasicFormParam2,
  handleBasicFormParamChange?: (
    p: IBasicFormParam2,
  ) => (e: React.FormEvent<HTMLInputElement>) => void,
) {
  if (!value.hasProperties) {
    // TODO(agamez): add custom input for objects an arrays
    return value?.type === "object" || value?.type === "array" ? (
      <span className={value?.hasProperties ? "headerRow" : ""}>
        {JSON.stringify(value?.currentValue)}
      </span>
    ) : (
      <>
        {value?.type === "boolean" && handleBasicFormParamChange && (
          <BooleanParam2 param={value} handleBasicFormParamChange={handleBasicFormParamChange} />
        )}
        {value?.type === "boolean" && !handleBasicFormParamChange && (
          <BooleanParam2
            param={value}
            handleBasicFormParamChange={function (
              _p: IBasicFormParam2,
            ): (e: FormEvent<HTMLInputElement>) => void {
              throw new Error("Function not implemented.");
            }}
          />
        )}
      </>
    );
  } else {
    return <></>;
  }
}
