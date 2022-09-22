import { JSONSchemaType } from "ajv";
import _ from "lodash";
import { parsePath, parsePathAndValue, toStringOptions } from "shared/schema";
import { DeploymentEvent } from "shared/types";
import YAML from "yaml";
import { IBasicFormParam2 } from "./tempType";

const IS_CUSTOM_COMPONENT_PROP_NAME = "x-is-custom-component";

export function extractParamsFromSchema(
  currentValues: YAML.Document.Parsed<YAML.ParsedNode>,
  packageValues: YAML.Document.Parsed<YAML.ParsedNode>,
  schema: JSONSchemaType<any>,
  deploymentEvent: DeploymentEvent,
  deployedValues?: YAML.Document.Parsed<YAML.ParsedNode>,
  parentPath?: string,
  // currentParam: IBasicFormParam2,
): IBasicFormParam2[] {
  let params: IBasicFormParam2[] = [];
  if (!_.isEmpty(schema?.properties)) {
    const properties = schema.properties;
    Object.keys(properties).forEach(propertyKey => {
      const schemaProperty = properties[propertyKey] as JSONSchemaType<any>;
      // The param path is its parent path + the object key
      const itemPath = `${parentPath || ""}${propertyKey}`;
      const isUpgrading = deploymentEvent === "upgrade" && deployedValues;
      const isLeaf = !schemaProperty?.properties;

      const param: IBasicFormParam2 = {
        ...schemaProperty,
        title: schemaProperty.title || propertyKey,
        key: itemPath,
        schema: schemaProperty,
        hasProperties: Boolean(schemaProperty?.properties),
        params: schemaProperty?.properties
          ? extractParamsFromSchema(
              currentValues,
              packageValues,
              schemaProperty,
              deploymentEvent,
              deployedValues,
              `${itemPath}/`,
            )
          : undefined,
        enum: schemaProperty?.enum?.map((item: { toString: () => any }) => item?.toString() ?? ""),
        // If exists, the value that is currently deployed
        deployedValue: isLeaf ? (isUpgrading ? getValueeeee(deployedValues, itemPath) : "") : "",
        // The default is the value comming from the package values or the one defined in the schema,
        // or vice-verse, which one shoulf take precedence?
        defaultValue: isLeaf
          ? getValueeeeeWithDefault(packageValues, itemPath, schemaProperty.default)
          : "",
        // same as default value, but this one will be later overwritten by the user input
        currentValue: isLeaf
          ? getValueeeeeWithDefault(currentValues, itemPath, schemaProperty.default)
          : "",
        isCustomComponent:
          schemaProperty?.customComponent || schemaProperty?.[IS_CUSTOM_COMPONENT_PROP_NAME],
      };
      params = params.concat(param);

      if (!schemaProperty?.properties) {
        params = params.concat(
          extractParamsFromSchema(
            currentValues,
            packageValues,
            schemaProperty,
            deploymentEvent,
            deployedValues,
            `${itemPath}/`,
          ),
        );
      }
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
  if (!paramsList) {
    return [];
  }

  // Find item index using _.findIndex
  const indexLeaf = _.findIndex(paramsList, { key: key });
  // is it a leaf node?
  if (!paramsList?.[indexLeaf]) {
    const a = key.split("/").slice(0, depth).join("/");
    const index = _.findIndex(paramsList, { key: a });
    if (paramsList?.[index]?.params) {
      _.set(
        paramsList[index],
        "currentValue",
        updateCurrentConfigByKey(paramsList?.[index]?.params || [], key, value, depth + 1),
      );
      return paramsList;
    }
  }
  // Replace item at index using native splice
  paramsList?.splice(indexLeaf, 1, {
    ...paramsList[indexLeaf],
    currentValue: value,
  });
  return paramsList;
}
