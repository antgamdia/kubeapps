import { CdsButton } from "@cds/react/button";
import { CdsIcon } from "@cds/react/icon";
import _ from "lodash";
import ReactTooltip from "react-tooltip";
import ArrayParam2 from "../ArrayParam2";
import BooleanParam2 from "../BooleanParam2";
import CustomFormComponentLoader2 from "../CustomFormParam2";
import SliderParam2 from "../SliderParam2";
import TextParam2 from "../TextParam2";
import { IBasicFormParam2 } from "./tempType";

const MAX_LENGTH = 60;

function renderCellWithTooltip(
  value: IBasicFormParam2,
  property: string,
  className = "",
  trimFromBeginning = false,
  maxLength = MAX_LENGTH,
) {
  // If the value is an object/array, we need to stringify it
  const stringValue = ["string", "number"].includes(typeof value?.[property])
    ? value?.[property] || ""
    : JSON.stringify(value?.[property]);

  if (stringValue?.length > maxLength) {
    const trimmedString = trimFromBeginning
      ? "..." + stringValue.substring(stringValue.length - maxLength, stringValue.length)
      : stringValue.substring(0, maxLength - 1) + "...";

    return (
      <span className={className}>
        <p data-tip={stringValue}>{trimmedString}</p>
        <ReactTooltip />
      </span>
    );
  } else {
    return <span className={className}>{stringValue}</span>;
  }
}

export function renderConfigKeyHeader(table: any, _saveAllChanges: any) {
  return (
    <>
      <div
        style={{
          textAlign: "left",
        }}
      >
        <>
          <CdsButton
            title={table.getIsAllRowsExpanded() ? "Collapse All" : "Expand All"}
            type="button"
            onClick={table.getToggleAllRowsExpandedHandler()}
            action="flat"
            status="primary"
            size="sm"
            className="table-button"
          >
            {table.getIsAllRowsExpanded() ? (
              <CdsIcon shape="minus" size="sm" solid={true} />
            ) : (
              <CdsIcon shape="plus" size="sm" solid={true} />
            )}
          </CdsButton>
          <span>Key</span>
        </>
      </div>
    </>
  );
}

export function renderConfigKey(value: IBasicFormParam2, row: any, _saveAllChanges: any) {
  return (
    <div
      className="left-algin self-center"
      style={{
        paddingLeft: `${row.depth * 0.5}rem`,
      }}
    >
      <>
        <div style={{ display: "inline-flex" }}>
          <CdsButton
            title={row.getIsExpanded() ? "Collapse" : "Expand"}
            type="button"
            onClick={row.getToggleExpandedHandler()}
            action="flat"
            status="primary"
            size="sm"
            disabled={!row.getCanExpand()}
            className="table-button"
          >
            {row.getCanExpand() ? (
              row.getIsExpanded() ? (
                <CdsIcon shape="minus" size="sm" solid={true} />
              ) : (
                <CdsIcon shape="plus" size="sm" solid={true} />
              )
            ) : (
              <></>
            )}
          </CdsButton>
          {renderCellWithTooltip(value, "key", "breakable self-center", true, MAX_LENGTH / 1.5)}
        </div>
      </>
    </div>
  );
}

export function renderConfigType(value: IBasicFormParam2) {
  return renderCellWithTooltip(value, "type", "italics");
}

export function renderConfigDescription(value: IBasicFormParam2) {
  return renderCellWithTooltip(value, "title", "breakable");
}

export function renderConfigDefaultValue(value: IBasicFormParam2) {
  return renderCellWithTooltip(value, "defaultValue", "breakable");
}

export function renderConfigDeployedValue(value: IBasicFormParam2) {
  return renderCellWithTooltip(value, "deployedValue");
}

export function renderConfigCurrentValuePro(
  param: IBasicFormParam2,
  handleBasicFormParamChange: (
    p: IBasicFormParam2,
  ) => (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
) {
  // early return if the value is marked as a custom form component
  if (param.isCustomComponent) {
    // TODO(agamez): consider using a modal window to display the full value
    return (
      <div id={param.key}>
        <CustomFormComponentLoader2
          param={param}
          handleBasicFormParamChange={handleBasicFormParamChange}
        />
      </div>
    );
  }
  // if the param has properties, each of them will be rendered as a row
  if (!_.isEmpty(param.hasProperties)) {
    return <></>;
  }

  // if it isn't a custom component or an with more properties, render an input
  switch (param.type) {
    case "string":
      return (
        <TextParam2
          id={param.key}
          label={param.title || param.path}
          param={param}
          inputType={param.title.includes("password") ? "password" : "string"}
          handleBasicFormParamChange={handleBasicFormParamChange}
        />
      );

    case "boolean":
      return (
        <BooleanParam2
          id={param.key}
          label={param.title || param.path}
          param={param}
          handleBasicFormParamChange={handleBasicFormParamChange}
        />
      );

    case "integer":
    case "number":
      return (
        <SliderParam2
          id={param.key}
          label={param.title || param.path}
          param={param}
          handleBasicFormParamChange={handleBasicFormParamChange}
          min={param.minimum || 1}
          max={param.maximum || 1000}
          step={param.type === "integer" ? 1 : 0.1}
          unit={""}
        />
      );
    case "array":
      if (["string", "number", "integer", "boolean"].includes(param?.schema?.items?.type)) {
        return (
          <ArrayParam2
            id={param.key}
            label={param.title || param.path}
            param={param}
            handleBasicFormParamChange={handleBasicFormParamChange}
            type={param?.schema?.items?.type}
          />
        );
      } else {
        // TODO(agamez): render the object properties
        return (
          <TextParam2
            id={param.key}
            label={param.title || param.path}
            param={param}
            inputType={"textarea"}
            handleBasicFormParamChange={handleBasicFormParamChange}
          />
        );
      }
    default:
      return (
        <TextParam2
          id={param.key}
          label={param.title || param.path}
          param={param}
          inputType={"textarea"}
          handleBasicFormParamChange={handleBasicFormParamChange}
        />
      );
  }
}
