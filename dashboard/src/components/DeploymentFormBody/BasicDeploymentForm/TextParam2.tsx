// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsControlMessage } from "@cds/react/forms";
import { CdsInput } from "@cds/react/input";
import { CdsTextarea } from "@cds/react/textarea";
import Column from "components/js/Column";
import Row from "components/js/Row";
import { useState } from "react";
// import { IAjvValidateResult, validate } from "shared/schema";
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

  const [currentValue, setCurrentValue] = useState(getStringValue(param));
  // const [validated, setValidated] = useState<IAjvValidateResult>();
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

  let input = (
    <>
      <CdsInput>
        <label htmlFor={id} className="hidden">
          {label}
        </label>
        <input id={id} type={inputType ?? "text"} value={currentValue} onChange={onChange} />
        {/* TODO(agamez): validate the value */}
        {/* {!validated?.valid ? ( */}
        {/* <CdsControlMessage status="error">{JSON.stringify(validated?.errors)}</CdsControlMessage> */}
        {/* ) : ( */}
        <CdsControlMessage>{isValueModified ? "Unsaved" : ""}</CdsControlMessage>
        {/* )} */}
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
        {/* {!validated?.valid ? (
          <CdsControlMessage status="error">{JSON.stringify(validated?.errors)}</CdsControlMessage>
        ) : ( */}
        <CdsControlMessage>{isValueModified ? "Unsaved" : ""}</CdsControlMessage>
        {/* )} */}
      </CdsTextarea>
    );
  }
  //TODO(agamez): check this case
  //  else if (!_.isEmpty(param.enum)) {
  //   input = (
  //     <>
  //       <label htmlFor={id}>{label}</label>
  //       <input
  //         id={id}
  //         onChange={onChange}
  //         value={value}
  //         className="clr-input deployment-form-text-input"
  //         type={inputType ? inputType : "text"}
  //       />
  //       <select id={id} onChange={handleBasicFormParamChange(param)} value={param.currentValue}>
  //         {param.enum.map((enumValue: any) => (
  //           <option key={enumValue}>{enumValue}</option>
  //         ))}
  //       </select>
  //     </>
  //   );
  // }
  return (
    <Row>
      <Column span={10}>{input}</Column>
    </Row>
  );
}

export default TextParam2;
