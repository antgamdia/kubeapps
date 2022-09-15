import { JSONSchemaType } from "ajv";
import { DeploymentEvent, JSONSchemaBasicType } from "shared/types";

// TEMPORARY INTERFACE, MOVE TO TYPES
export type IBasicFormParam2 = JSONSchemaType<any> & {
  key: string;
  title: string;
  hasProperties: boolean;
  params?: IBasicFormParam2[];
  defaultValue: any;
  deployedValue: any;
  currentValue: any;
  // TODO(agamez): support custom components again
  // customComponent?: object;

  // type: JSONSchemaBasicType;
  // description: string;
  // hasProperties: boolean;
  // enum?: string[];

  // OLD
  // path: string;
  // type?: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null" | "any"; // https://json-schema.org/understanding-json-schema/reference/type.html
  // value?: any;
  // title?: string;
  // minimum?: number;
  // maximum?: number;
  // render?: string;
  // description?: string;
  // enum?: string[];
  // hidden?:
  //   | {
  //       event: DeploymentEvent;
  //       path: string;
  //       value: string;
  //       conditions: Array<{
  //         event: DeploymentEvent;
  //         path: string;
  //         value: string;
  //       }>;
  //       operator: string;
  //     }
  //   | string;
  // children?: IBasicFormParam2[];
};
