import { JSONSchemaType } from "ajv";
import _ from "lodash";
import { parsePath, parsePathAndValue, toStringOptions } from "shared/schema";
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

export function setValueee(
  valuesNode: YAML.Document.Parsed<YAML.ParsedNode>,
  path: string,
  newValue: any,
) {
  const { splittedPath, value } = parsePathAndValue(valuesNode, path, newValue);
  valuesNode.setIn(splittedPath, value);
  return valuesNode.toString(toStringOptions);
}

export function updateCurrentConfigByKey(
  paramsList: IBasicFormParam2[],
  key: string,
  value: any,
  depth = 1,
): any {
  console.log("updateCurrentConfigByKey");
  // console.log("\tparamsList ", JSON.stringify(paramsList));
  console.log("\tparamsList ", paramsList);
  // Find item index using _.findIndex
  const indexLeaf = _.findIndex(paramsList, { key: key });
  // is it a leaf node?
  console.log("trying... ", key);
  if (!paramsList?.[indexLeaf]) {
    //   console.log("yeah, it is a leaf node", paramsList?.[index]);
    //   paramsList[index].currentValue = "PEPE";
    //   return paramsList;
    // } else {
    // const a = key.split(/\/(.*)/s);
    const a = key.split("/").slice(0, depth).join("/");
    console.log("not leaf, trying... ", a);
    const index = _.findIndex(paramsList, { key: a });
    if (paramsList?.[index]?.properties) {
      console.log("searching for ", a, "in", paramsList[index]);
      _.set(
        paramsList[index],
        "currentValue",
        updateCurrentConfigByKey(paramsList?.[index]?.properties || [], key, value, depth + 1),
      );
      return paramsList;
    }
  }

  // // eslint-disable-next-line no-debugger
  // debugger;
  // // Replace item at index using native splice
  console.log("\tparamsList[index] ", paramsList[indexLeaf]);
  paramsList.splice(indexLeaf, 1, {
    ...paramsList[indexLeaf],
    currentValue: value,
  });
  console.log("\tparamsList[indexLeaf] -changed ", {
    ...paramsList[indexLeaf],
    currentValue: value,
  });
  console.log("\tparamsList ", paramsList);
  return paramsList;
}
