// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsControlMessage } from "@cds/react/forms";
import { CdsInput } from "@cds/react/input";
import { CdsRange } from "@cds/react/range";
import Column from "components/js/Column";
import Row from "components/js/Row";
import _ from "lodash";
import { useState } from "react";
import { IBasicFormParam2 } from "shared/types";
import { basicFormsDebounceTime } from "shared/utils";

export interface ISliderParamProps {
  id: string;
  label: string;
  param: IBasicFormParam2;
  unit: string;
  min: number;
  max: number;
  step: number;
  handleBasicFormParamChange: (
    p: IBasicFormParam2,
  ) => (e: React.FormEvent<HTMLInputElement>) => void;
}

function SliderParam2(props: ISliderParamProps) {
  const { handleBasicFormParamChange, id, label, max, min, param, step } = props;

  const [currentValue, setCurrentValue] = useState(_.toNumber(param.currentValue) || min);
  const [isValueModified, setIsValueModified] = useState(false);
  const [timeout, setThisTimeout] = useState({} as NodeJS.Timeout);

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    setCurrentValue(_.toNumber(e.currentTarget.value));
    setIsValueModified(_.toNumber(e.currentTarget.value) !== param.currentValue);
    // Gather changes before submitting
    clearTimeout(timeout);
    const func = handleBasicFormParamChange(param);
    // The reference to target get lost, so we need to keep a copy
    const targetCopy = {
      currentTarget: {
        value: e.currentTarget.value,
        type: e.currentTarget.type,
      },
    } as React.FormEvent<HTMLInputElement>;
    setThisTimeout(setTimeout(() => func(targetCopy), basicFormsDebounceTime));
  };

  const input = (
    <CdsRange>
      <input
        aria-label={label}
        type="range"
        min={Math.min(min, currentValue)}
        max={Math.max(max, currentValue)}
        step={step}
        onChange={onChange}
        value={currentValue}
      />
      <CdsControlMessage>{isValueModified ? "Unsaved" : ""}</CdsControlMessage>
    </CdsRange>
  );

  const inputText = (
    <div className="self-center">
      <CdsInput>
        <input
          aria-label={label}
          id={id + "_text"}
          type="number"
          step={step}
          onChange={onChange}
          value={currentValue}
        />
      </CdsInput>
    </div>
  );

  return (
    <Row>
      <Column span={3}>{inputText}</Column>
      <Column span={7}>{input}</Column>
    </Row>
  );
}

export default SliderParam2;
