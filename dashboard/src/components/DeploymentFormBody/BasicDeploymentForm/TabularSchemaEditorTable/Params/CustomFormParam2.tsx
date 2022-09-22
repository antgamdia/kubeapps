// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { CustomComponent } from "RemoteComponent";
import { IBasicFormParam2, IStoreState } from "shared/types";

export interface ICustomParamProps {
  param: IBasicFormParam2;
  handleBasicFormParamChange: (
    p: IBasicFormParam2,
  ) => (e: React.FormEvent<HTMLInputElement>) => void;
}

export default function CustomFormComponentLoader2({
  param,
  handleBasicFormParamChange,
}: ICustomParamProps) {
  // Fetches the custom-component bundle served by the dashboard nginx

  const {
    config: { remoteComponentsUrl },
  } = useSelector((state: IStoreState) => state);

  const url = remoteComponentsUrl
    ? remoteComponentsUrl
    : `${window.location.origin}/custom_components.js`;

  return useMemo(
    () => (
      <CustomComponent
        url={url}
        param={param}
        handleBasicFormParamChange={handleBasicFormParamChange}
      />
    ),
    [handleBasicFormParamChange, param, url],
  );
}
