import { CdsButton } from "@cds/react/button";
import { CdsIcon } from "@cds/react/icon";
import ReactTooltip from "react-tooltip";
import BooleanParam2 from "../BooleanParam2";
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

export function renderConfigKeyHeader(table: any) {
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
            style={{ marginLeft: "-0.75em", marginRight: "-0.75em" }}
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

export function renderConfigKey(value: IBasicFormParam2, row: any) {
  return (
    <div
      style={{
        paddingLeft: `${row.depth * 0.5}rem`,
        textAlign: "left",
      }}
    >
      <>
        <CdsButton
          title={row.getIsExpanded() ? "Collapse" : "Expand"}
          type="button"
          onClick={row.getToggleExpandedHandler()}
          action="flat"
          status="primary"
          size="sm"
          disabled={!row.getCanExpand()}
          style={{ marginLeft: "-0.75em", marginRight: "-0.75em" }}
        >
          {!row.getCanExpand() || row.getIsExpanded() ? (
            <CdsIcon shape="minus" size="sm" solid={true} />
          ) : (
            <CdsIcon shape="plus" size="sm" solid={true} />
          )}
        </CdsButton>
        {renderCellWithTooltip(value, "key", "breakable", true, MAX_LENGTH / 1.5)}
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
  if (!param.hasProperties) {
    // TODO(agamez): add custom input for objects an arrays
    return (
      <>
        {["boolean"].includes(param?.type) && (
          <BooleanParam2 param={param} handleBasicFormParamChange={handleBasicFormParamChange} />
        )}
        {["integer", "number"].includes(param?.type) && (
          <SliderParam2
            label={param.title || param.path}
            handleBasicFormParamChange={handleBasicFormParamChange}
            id={param.key}
            param={param}
            min={param.minimum || 1}
            max={param.maximum || 1000}
            step={1}
            unit={""}
          />
        )}
        {["string"].includes(param?.type) && (
          <TextParam2
            label={param.title || param.path}
            handleBasicFormParamChange={handleBasicFormParamChange}
            id={param.key}
            param={param}
            inputType={param.title.includes("password") ? "password" : "string"}
          />
        )}
        {["array", "object"].includes(param?.type) && (
          <TextParam2
            label={param.title || param.path}
            handleBasicFormParamChange={handleBasicFormParamChange}
            id={param.key}
            param={param}
            inputType={"textarea"}
          />
        )}
      </>
    );
  } else {
    return <></>;
  }
}
