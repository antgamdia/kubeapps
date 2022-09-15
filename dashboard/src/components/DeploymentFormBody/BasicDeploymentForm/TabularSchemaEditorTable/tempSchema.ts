import { JSONSchemaType } from "ajv";
import _ from "lodash";
import { parsePath, parsePathAndValue, toStringOptions } from "shared/schema";
import { DeploymentEvent } from "shared/types";
import YAML from "yaml";
import { IBasicFormParam2 } from "./tempType";

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
  if (schema?.properties) {
    const properties = schema.properties;
    Object.keys(properties).forEach(propertyKey => {
      const schemaProperty = properties[propertyKey] as JSONSchemaType<any>;

      console.log("schemaProperty", schemaProperty);

      // The param path is its parent path + the object key
      const itemPath = `${parentPath || ""}${propertyKey}`;
      const param: IBasicFormParam2 = {
        ...schemaProperty,
        title: schemaProperty.title || propertyKey,
        key: itemPath,
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
        // If exists, the value that is currently deployed
        deployedValue:
          deploymentEvent === "upgrade" && deployedValues
            ? getValueeeee(deployedValues, itemPath)
            : "",
        // The default is the value comming from the package values or the one defined in the schema,
        // or vice-verse, which one shoulf take precedence?
        defaultValue: getValueeeeeWithDefault(packageValues, itemPath, schemaProperty.default),
        // same as default value, but this one will be later overwritten by the user input
        currentValue: getValueeeeeWithDefault(currentValues, itemPath, schemaProperty.default),
        // TODO(agamez): support custom components again
        // customComponent: schemaProperty.customComponent,
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
  console.log("updateCurrentConfigByKey");
  if (!paramsList) {
    return [];
  }

  // console.log("\tparamsList ", JSON.stringify(paramsList));
  // console.log("\tparamsList ", paramsList);
  // Find item index using _.findIndex
  const indexLeaf = _.findIndex(paramsList, { key: key });
  // is it a leaf node?
  // console.log("trying... ", key);
  if (!paramsList?.[indexLeaf]) {
    //   console.log("yeah, it is a leaf node", paramsList?.[index]);
    //   paramsList[index].currentValue = "PEPE";
    //   return paramsList;
    // } else {
    // const a = key.split(/\/(.*)/s);
    const a = key.split("/").slice(0, depth).join("/");
    // console.log("not leaf, trying... ", a);
    const index = _.findIndex(paramsList, { key: a });
    if (paramsList?.[index]?.params) {
      // console.log("searching for ", a, "in", paramsList[index]);
      _.set(
        paramsList[index],
        "currentValue",
        updateCurrentConfigByKey(paramsList?.[index]?.params || [], key, value, depth + 1),
      );
      return paramsList;
    }
  }
  // Replace item at index using native splice
  // console.log("\tparamsList[index] ", paramsList[indexLeaf]);
  paramsList?.splice(indexLeaf, 1, {
    ...paramsList[indexLeaf],
    currentValue: value,
  });
  // console.log("\tparamsList[indexLeaf] -changed ", {
  //   ...paramsList[indexLeaf],
  //   currentValue: value,
  // });
  // console.log("\tparamsList ", paramsList);
  return paramsList;
}
