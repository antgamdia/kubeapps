// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { MonacoDiffEditor } from "react-monaco-editor";
import { useSelector } from "react-redux";
import { IStoreState } from "shared/types";

export interface IOperatorAdvancedDeploymentFormProps {
  appValues?: string;
  oldAppValues?: string;
  handleValuesChange: (value: string) => void;
  children?: JSX.Element;
}

function OperatorAdvancedDeploymentForm(props: IOperatorAdvancedDeploymentFormProps) {
  let timeout: NodeJS.Timeout;
  const onChange = (value: string) => {
    // Gather changes before submitting
    clearTimeout(timeout);
    timeout = setTimeout(() => props.handleValuesChange(value), 500);
  };
  const {
    config: { theme },
  } = useSelector((state: IStoreState) => state);
  const diffEditorOptions = {
    renderSideBySide: false,
    automaticLayout: true,
  };

  return (
    <div className="deployment-form-tabs-data">
      <MonacoDiffEditor
        value={props.appValues}
        original={props.oldAppValues}
        className="editor"
        height="90vh"
        language="yaml"
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={diffEditorOptions}
        onChange={onChange}
      />
      {props.children}
    </div>
  );
}

export default OperatorAdvancedDeploymentForm;
