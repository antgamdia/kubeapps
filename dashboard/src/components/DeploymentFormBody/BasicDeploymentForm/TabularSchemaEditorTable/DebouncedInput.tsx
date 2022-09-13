// Copyright 2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsInput } from "@cds/react/input";
import { InputHTMLAttributes, useEffect, useState } from "react";

/* eslint-disable jsx-a11y/label-has-associated-control */
export default function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <CdsInput>
      <label>{props.title || "input"}</label>
      <input {...props} value={value} onChange={e => setValue(e.target.value)} />
    </CdsInput>
  );
}
