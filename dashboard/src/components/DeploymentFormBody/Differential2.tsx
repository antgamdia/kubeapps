// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import MonacoDiffEditor from "react-monaco-editor/lib/diff";
import { useSelector } from "react-redux";
import { IStoreState } from "shared/types";
import "./Differential.css";

export interface IDifferentialProps {
  oldValues: string;
  newValues: string;
  emptyDiffElement: JSX.Element;
}

export default function Differential2(props: IDifferentialProps) {
  const { oldValues, newValues } = props;
  const {
    config: { theme },
  } = useSelector((state: IStoreState) => state);

  const options = {
    // renderSideBySide: false,
    // enableSplitViewResizing: false,
    readOnly: true,
  };
  return (
    <div className="diff deployment-form-tabs-data">
      <MonacoDiffEditor
        height="90vh"
        original={oldValues}
        value={newValues}
        className="editor"
        language="yaml"
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={options}
      ></MonacoDiffEditor>
    </div>
  );
}
