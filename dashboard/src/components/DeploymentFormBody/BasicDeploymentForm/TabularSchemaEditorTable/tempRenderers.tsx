import { CdsButton } from "@cds/react/button";
import { CdsIcon } from "@cds/react/icon";
import ReactTooltip from "react-tooltip";
import BooleanParam2 from "../BooleanParam2";
import SliderParam2 from "../SliderParam2";
import TextParam2 from "../TextParam2";
import { IBasicFormParam2 } from "./tempType";

const MAX_LENGTH = 55;

export function renderConfigKeyHeader(table: any) {
  return (
    <>
      <div
        style={{
          textAlign: "left",
        }}
      >
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
      </div>
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

function renderCellWithTooltip(value: IBasicFormParam2, property: string) {
  const stringValue = ["string", "number"].includes(typeof value?.[property])
    ? value?.[property] || ""
    : JSON.stringify(value?.[property]);

  return stringValue?.length > MAX_LENGTH ? (
    <span>
      <p data-tip={stringValue}>{stringValue.slice(0, MAX_LENGTH - 1) + "..."}</p>
      <ReactTooltip />
    </span>
  ) : (
    <span>{stringValue}</span>
  );
}

export function renderConfigType(value: IBasicFormParam2) {
  return renderCellWithTooltip(value, "type");
}

export function renderConfigDescription(value: IBasicFormParam2) {
  return renderCellWithTooltip(value, "title");
}

export function renderConfigDefaultValue(value: IBasicFormParam2) {
  return renderCellWithTooltip(value, "defaultValue");
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
