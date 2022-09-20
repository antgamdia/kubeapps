// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsControlMessage } from "@cds/react/forms";
import { CdsToggle, CdsToggleGroup } from "@cds/react/toggle";
import Column from "components/js/Column";
import Row from "components/js/Row";
import { useState } from "react";
import { IBasicFormParam2 } from "./TabularSchemaEditorTable/tempType";

export interface IBooleanParamProps {
  id: string;
  label: string;
  param: IBasicFormParam2;
  handleBasicFormParamChange: (
    p: IBasicFormParam2,
  ) => (e: React.FormEvent<HTMLInputElement>) => void;
}
export default function BooleanParam2(props: IBooleanParamProps) {
  const { id, label, param, handleBasicFormParamChange } = props;

  const [currentValue, setCurrentValue] = useState(param.currentValue);
  const [isValueModified, setIsValueModified] = useState(false);

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    // create an event that "getValueFromEvent" can process,
    const event = {
      currentTarget: {
        //convert the boolean "checked" prop to a normal "value" string one
        value: e.currentTarget.checked.toString(),
        type: "checkbox",
      },
    } as React.FormEvent<HTMLInputElement>;
    setCurrentValue(e.currentTarget.checked);
    setIsValueModified(e.currentTarget.checked !== param.currentValue);
    handleBasicFormParamChange(param)(event);
  };

  const input = (
    <CdsToggleGroup className="flex-v-center">
      <CdsToggle>
        <label htmlFor={id} className="hidden">
          {label}
        </label>
        <input id={id} type="checkbox" onChange={onChange} checked={currentValue} />
        <CdsControlMessage>{isValueModified ? "Unsaved" : ""}</CdsControlMessage>
      </CdsToggle>
    </CdsToggleGroup>
  );

  return (
    <Row>
      <Column span={10}>{input}</Column>
    </Row>
  );
}
