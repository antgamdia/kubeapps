// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsToggle, CdsToggleGroup } from "@cds/react/toggle";
import { IBasicFormParam2 } from "./TabularSchemaEditorTable/tempType";

export interface IStringParamProps {
  // id: string;
  // // label: string;
  param: IBasicFormParam2;
  handleBasicFormParamChange: (
    p: IBasicFormParam2,
  ) => (e: React.FormEvent<HTMLInputElement>) => void;
}
export default function BooleanParam2({ param, handleBasicFormParamChange }: IStringParamProps) {
  // handleChange transform the event received by the Switch component to a checkbox event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const event = {
      currentTarget: {
        value: e.target.checked.toString(),
        type: "checkbox",
      },
    } as React.FormEvent<HTMLInputElement>;
    handleBasicFormParamChange(param)(event);
  };
  return (
    <>
      <CdsToggleGroup className="flex-v-center">
        <CdsToggle>
          <label htmlFor={"toggle_" + param.key}>{param.title}</label>
          <input
            id={"toggle_" + param.key}
            type="checkbox"
            onChange={handleChange}
            checked={param?.currentValue?.toString() === "true"}
          />
        </CdsToggle>
      </CdsToggleGroup>
    </>
  );
}
