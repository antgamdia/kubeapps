import { DeploymentEvent, JSONSchemaBasicType } from "shared/types";

// TEMPORARY INTERFACE, MOVE TO TYPES
export interface IBasicFormParam2 {
  key: string;
  type: JSONSchemaBasicType;
  description: string;
  hasProperties: boolean;
  defaultValue: any;
  deployedValue: any;
  currentValue: any;
  title: string;
  properties?: IBasicFormParam2[];
  enum?: string[];

  // OLD
  path: string;
  // type?: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null" | "any"; // https://json-schema.org/understanding-json-schema/reference/type.html
  value?: any;
  // title?: string;
  minimum?: number;
  maximum?: number;
  render?: string;
  // description?: string;
  customComponent?: object;
  // enum?: string[];
  hidden?:
    | {
        event: DeploymentEvent;
        path: string;
        value: string;
        conditions: Array<{
          event: DeploymentEvent;
          path: string;
          value: string;
        }>;
        operator: string;
      }
    | string;
  // children?: IBasicFormParam2[];
}
