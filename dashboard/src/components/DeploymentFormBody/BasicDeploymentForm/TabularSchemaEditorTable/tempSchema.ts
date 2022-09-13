import { JSONSchemaType } from "ajv";
import { parsePath, toStringOptions } from "shared/schema";
import { DeploymentEvent } from "shared/types";
import YAML from "yaml";
import { IBasicFormParam2 } from "./tempType";

export function extractParamsFromSchema(
  valuesNode: YAML.Document.Parsed<YAML.ParsedNode>,
  schema: JSONSchemaType<any>,
  deploymentEvent: DeploymentEvent,
  parentPath?: string,
  // currentParam: IBasicFormParam2,
): IBasicFormParam2[] {
  let params: IBasicFormParam2[] = [];
  if (schema?.properties) {
    const properties = schema.properties;
    Object.keys(properties).forEach(propertyKey => {
      const paramRaw = properties[propertyKey];
      // The param path is its parent path + the object key
      const itemPath = `${parentPath || ""}${propertyKey}`;
      const param: IBasicFormParam2 = {
        description: paramRaw.description ?? "",
        hasProperties: Boolean(paramRaw?.properties),

        type: paramRaw.type ?? "",
        key: itemPath,
        defaultValue: typeof paramRaw.default === "object" ? "" : paramRaw.default,
        deployedValue: deploymentEvent === "upgrade" ? getValueeeee(valuesNode, itemPath) : "",
        currentValue: getValueeeeeWithDefault(valuesNode, itemPath, paramRaw.default),
        title: propertyKey ?? "",
        // others
        ...paramRaw,

        // deprecated
        // path: itemPath,
        // // deprecated
        enum: paramRaw.enum?.map((item: any) => item?.toString() ?? ""),
        // deprecated
        properties: paramRaw?.properties
          ? extractParamsFromSchema(valuesNode, paramRaw, deploymentEvent, `${itemPath}/`)
          : undefined,
      };
      params = params.concat(param);

      // if (param.hasProperties) {
      //   // parseProperties(properties[propertyName].properties, tableEntry.key);

      // If the property is an object, iterate recursively
      // if (schema.properties![propertyKey].type === "object") {
      if (!paramRaw?.properties) {
        params = params.concat(
          extractParamsFromSchema(valuesNode, paramRaw, deploymentEvent, `${itemPath}/`),
        );
      }
      // }
    });
  }
  return params;
}

export function getValueeeeeWithDefault(
  values: YAML.Document.Parsed<YAML.ParsedNode>,
  path: string,
  defaultValue?: any,
) {
  const value = getValueeeee(values, path);

  return value === undefined || value === null ? defaultValue : value;
}

export function getValueeeee(values: YAML.Document.Parsed<YAML.ParsedNode>, path: string) {
  const splittedPath = parsePath(path);
  const value = values?.getIn(splittedPath);
  return value;
}

export function parseToYAMLNodes(string: string) {
  return YAML.parseDocument(string, { toStringDefaults: toStringOptions });
}
