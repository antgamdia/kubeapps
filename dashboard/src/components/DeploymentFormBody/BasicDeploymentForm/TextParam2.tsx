// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsControlMessage } from "@cds/react/forms";
import { CdsInput } from "@cds/react/input";
import { CdsSelect } from "@cds/react/select";
import { CdsTextarea } from "@cds/react/textarea";
import Column from "components/js/Column";
import Row from "components/js/Row";
import _ from "lodash";
import { useState } from "react";
import { basicFormsDebounceTime } from "shared/utils";
import { IBasicFormParam2 } from "./TabularSchemaEditorTable/tempType";

export interface ITextParamProps {
  id: string;
  label: string;
  inputType?: string;
  param: IBasicFormParam2;
  handleBasicFormParamChange: (
    param: IBasicFormParam2,
  ) => (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

function getStringValue(param: IBasicFormParam2, value?: any) {
  if (["array", "object"].includes(param?.type)) {
    return JSON.stringify(value || param?.currentValue);
  } else {
    return value?.toString() || param?.currentValue?.toString();
  }
}

function TextParam2(props: ITextParamProps) {
  const { id, label, inputType, param, handleBasicFormParamChange } = props;

  // const [validated, setValidated] = useState<IAjvValidateResult>();
  const [currentValue, setCurrentValue] = useState(getStringValue(param));
  const [isValueModified, setIsValueModified] = useState(false);
  const [timeout, setThisTimeout] = useState({} as NodeJS.Timeout);

  const onChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    // TODO(agamez): validate the value
    // setValidated(validate(e.currentTarget.value, param.schema));
    setCurrentValue(e.currentTarget.value);
    setIsValueModified(e.currentTarget.value !== param.currentValue);
    // Gather changes before submitting
    clearTimeout(timeout);
    const func = handleBasicFormParamChange(param);
    // The reference to target get lost, so we need to keep a copy
    const targetCopy = {
      currentTarget: {
        value: e.currentTarget.value,
        type: e.currentTarget.type,
      },
    } as React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
    setThisTimeout(setTimeout(() => func(targetCopy), basicFormsDebounceTime));
  };

  const unsavedMessage = isValueModified ? "Unsaved" : "";

  let input = (
    <>
      <CdsInput>
        <label htmlFor={id} className="hidden">
          {label}
        </label>
        <input id={id} type={inputType ?? "text"} value={currentValue} onChange={onChange} />
        {/* TODO(agamez): validate the value */}
        {/* {!validated?.valid && !_.isEmpty(validated?.errors) && (
          <CdsControlMessage status="error">
            {validated?.errors?.map(e => e.message).join(", ")}
          </CdsControlMessage>
        )} */}
        <CdsControlMessage>{unsavedMessage}</CdsControlMessage>
      </CdsInput>
    </>
  );
  if (inputType === "textarea") {
    input = (
      <CdsTextarea>
        <label htmlFor={id} className="hidden">
          {label}
        </label>
        <textarea id={id} value={currentValue} onChange={onChange} />
        {/* TODO(agamez): validate the value */}
        {/* {!validated?.valid && (
          <CdsControlMessage status="error">
            {validated?.errors?.map(e => e.message).join(", ")}
          </CdsControlMessage>
        )} */}
        <CdsControlMessage>{unsavedMessage}</CdsControlMessage>
      </CdsTextarea>
    );
  } else if (!_.isEmpty(param.enum)) {
    input = (
      <>
        <CdsSelect layout="horizontal">
          <label htmlFor={id} className="hidden">
            {label}
          </label>
          <select id={id} onChange={onChange} value={currentValue}>
            {param?.enum?.map((enumValue: any) => (
              <option key={enumValue}>{enumValue}</option>
            ))}
          </select>
          {/* TODO(agamez): validate the value */}
          {/* {!validated?.valid && (
            <CdsControlMessage status="error">
              {validated?.errors?.map(e => e.message).join(", ")}
            </CdsControlMessage>
          )} */}
          <CdsControlMessage>{unsavedMessage}</CdsControlMessage>
        </CdsSelect>
      </>
    );
  }
  return (
    <Row>
      <Column span={10}>{input}</Column>
    </Row>
  );
}

export default TextParam2;
