// Copyright 2021-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { MonacoDiffEditor } from "react-monaco-editor";
import { SupportedThemes } from "shared/Config";
import { defaultStore, getStore, mountWrapper } from "shared/specs/mountWrapper";
import { IStoreState } from "shared/types";
import AdvancedDeploymentForm from "./AdvancedDeploymentForm";

const defaultProps = {
  valuesFromTheDeployedPackage: "",
  deploymentEvent: "",
  valuesFromTheAvailablePackage: "",
  handleValuesChange: function (_value: string): void {
    return;
  },
};

it("includes values", () => {
  const wrapper = mountWrapper(
    defaultStore,
    <AdvancedDeploymentForm {...defaultProps} valuesFromTheAvailablePackage="foo: bar" />,
  );
  expect(wrapper.find(MonacoDiffEditor).prop("value")).toBe("foo: bar");
});

it("sets light theme by default", () => {
  const wrapper = mountWrapper(defaultStore, <AdvancedDeploymentForm {...defaultProps} />);
  expect(wrapper.find(MonacoDiffEditor).prop("theme")).toBe("xcode");
});

it("changes theme", () => {
  const wrapper = mountWrapper(
    getStore({ config: { theme: SupportedThemes.dark } } as Partial<IStoreState>),
    <AdvancedDeploymentForm {...defaultProps} />,
  );
  expect(wrapper.find(MonacoDiffEditor).prop("theme")).toBe("solarized_dark");
});
