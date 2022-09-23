// Copyright 2021-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import MonacoEditor from "react-monaco-editor";
import { SupportedThemes } from "shared/Config";
import { defaultStore, getStore, mountWrapper } from "shared/specs/mountWrapper";
import { IStoreState } from "shared/types";
import OperatorAdvancedDeploymentForm from "./OperatorAdvancedDeploymentForm";

const defaultProps = {
  handleValuesChange: jest.fn(),
};

it("includes values", () => {
  const wrapper = mountWrapper(
    defaultStore,
    <OperatorAdvancedDeploymentForm {...defaultProps} appValues="foo: bar" />,
  );
  expect(wrapper.find(MonacoEditor).prop("value")).toBe("foo: bar");
});

it("sets light theme by default", () => {
  const wrapper = mountWrapper(defaultStore, <OperatorAdvancedDeploymentForm {...defaultProps} />);
  expect(wrapper.find(MonacoEditor).prop("theme")).toBe("xcode");
});

it("changes theme", () => {
  const wrapper = mountWrapper(
    getStore({ config: { theme: SupportedThemes.dark } } as Partial<IStoreState>),
    <OperatorAdvancedDeploymentForm {...defaultProps} />,
  );
  expect(wrapper.find(MonacoEditor).prop("theme")).toBe("solarized_dark");
});
