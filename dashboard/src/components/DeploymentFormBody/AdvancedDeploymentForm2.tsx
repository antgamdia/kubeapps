/* eslint-disable no-debugger */
// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsToggle, CdsToggleGroup } from "@cds/react/toggle";
import monaco from "monaco-editor/esm/vs/editor/editor.api"; // for types only
import { useState } from "react";
import { MonacoDiffEditor } from "react-monaco-editor";
import { useSelector } from "react-redux";
import { IStoreState } from "shared/types";

export interface IAdvancedDeploymentForm {
  valuesFromTheParentContainer?: string;
  handleValuesChange: (value: string) => void;
  children?: JSX.Element;
  valuesFromTheDeployedPackage: string;
  valuesFromTheAvailablePackage: string;
  deploymentEvent: string;
}

export default function AdvancedDeploymentForm2(props: IAdvancedDeploymentForm) {
  const {
    config: { theme },
  } = useSelector((state: IStoreState) => state);
  const {
    handleValuesChange,
    valuesFromTheParentContainer,
    valuesFromTheDeployedPackage,
    valuesFromTheAvailablePackage,
    deploymentEvent,
  } = props;

  const diffEditorOptions = {
    renderSideBySide: false,
    automaticLayout: true,
  };

  let timeout: NodeJS.Timeout;
  const onChange = (value: string | undefined, _ev: any) => {
    // Gather changes before submitting
    clearTimeout(timeout);
    timeout = setTimeout(() => handleValuesChange(value || ""), 500);
  };

  const [usePackageDefaults, setUsePackageDefaults] = useState(
    deploymentEvent === "upgrade" ? false : true,
  );

  const editorDidMount = (editor: monaco.editor.IStandaloneDiffEditor, m: typeof monaco) => {
    // Add "go to the next change" action
    editor.addAction({
      id: "goToNextChange",
      label: "Go to the next change",
      keybindings: [m.KeyMod.Alt | m.KeyCode.KeyG],
      contextMenuGroupId: "9_cutcopypaste",
      run: () => {
        const lineChanges = editor?.getLineChanges() as monaco.editor.ILineChange[];
        lineChanges.some(lineChange => {
          const currentPosition = editor?.getPosition() as monaco.Position;
          if (currentPosition.lineNumber < lineChange.modifiedEndLineNumber) {
            // Set the cursor to the next change
            editor?.setPosition({
              lineNumber: lineChange.modifiedEndLineNumber,
              column: 1,
            });
            // Scroll to the next change
            editor?.revealPositionInCenter({
              lineNumber: lineChange.modifiedEndLineNumber,
              column: 1,
            });
            // Return true to stop the loop
            return true;
          }
          return false;
        });
      },
    });
    // Add "go to the previous change" action
    editor.addAction({
      id: "goToPreviousChange",
      label: "Go to the previous change",
      keybindings: [m.KeyMod.Alt | m.KeyCode.KeyF],
      contextMenuGroupId: "9_cutcopypaste",
      run: () => {
        const lineChanges = editor?.getLineChanges() as monaco.editor.ILineChange[];
        lineChanges.some(lineChange => {
          const currentPosition = editor?.getPosition() as monaco.Position;
          if (currentPosition.lineNumber > lineChange.modifiedEndLineNumber) {
            // Set the cursor to the next change
            editor?.setPosition({
              lineNumber: lineChange.modifiedEndLineNumber,
              column: 1,
            });
            // Scroll to the next change
            editor?.revealPositionInCenter({
              lineNumber: lineChange.modifiedEndLineNumber,
              column: 1,
            });
            // Return true to stop the loop
            return true;
          }
          return false;
        });
      },
    });

    // Add the "toggle deployed/package default values" action
    if (deploymentEvent === "upgrade") {
      editor.addAction({
        id: "useDefaultsFalse",
        label: "Use default values",
        keybindings: [m.KeyMod.Alt | m.KeyCode.KeyD],
        contextMenuGroupId: "9_cutcopypaste",
        run: () => {
          setUsePackageDefaults(false);
        },
      });
      editor.addAction({
        id: "useDefaultsTrue",
        label: "Use package values",
        keybindings: [m.KeyMod.Alt | m.KeyCode.KeyV],
        contextMenuGroupId: "9_cutcopypaste",
        run: () => {
          setUsePackageDefaults(true);
        },
      });
    }
  };

  return (
    <div className="deployment-form-tabs-data">
      {deploymentEvent === "upgrade" && (
        <CdsToggleGroup className="flex-v-center">
          <CdsToggle>
            <label htmlFor={"toggle_"}>
              {usePackageDefaults
                ? "Compare against the package's default values"
                : "Compare against the currently deployed values"}
            </label>
            <input
              id={"toggle_"}
              type="checkbox"
              onChange={e => {
                setUsePackageDefaults(e.target.checked);
              }}
              checked={!!usePackageDefaults}
            />
          </CdsToggle>
        </CdsToggleGroup>
      )}
      <br />
      <MonacoDiffEditor
        original={usePackageDefaults ? valuesFromTheAvailablePackage : valuesFromTheDeployedPackage}
        className="editor"
        height="90vh"
        language="yaml"
        theme={theme === "dark" ? "vs-dark" : "light"}
        value={valuesFromTheParentContainer}
        options={diffEditorOptions}
        onChange={onChange}
        editorDidMount={editorDidMount}
      />
    </div>
  );
}
