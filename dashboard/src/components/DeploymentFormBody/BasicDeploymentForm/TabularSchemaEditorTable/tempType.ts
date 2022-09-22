import { JSONSchemaType } from "ajv";

// TEMPORARY INTERFACE, MOVE TO TYPES
export type IBasicFormParam2 = JSONSchemaType<any> & {
  key: string;
  title: string;
  hasProperties: boolean;
  params?: IBasicFormParam2[];
  enum?: string[];
  defaultValue: any;
  deployedValue: any;
  currentValue: any;
  schema: JSONSchemaType<any>;
  isCustomComponent?: boolean;
};
