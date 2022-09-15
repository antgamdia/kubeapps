// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsButton } from "@cds/react/button";
import { CdsIcon } from "@cds/react/icon";
import Alert from "components/js/Alert";
import Tabs from "components/Tabs";
import { FormEvent, useCallback, useEffect, useState } from "react";
import YAML from "yaml";
import { toStringOptions } from "../../shared/schema";
import { DeploymentEvent, IPackageState } from "../../shared/types";
import { getValueFromEvent } from "../../shared/utils";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import LoadingWrapper from "../LoadingWrapper/LoadingWrapper";
import AdvancedDeploymentForm from "./AdvancedDeploymentForm";
import BasicDeploymentForm from "./BasicDeploymentForm/BasicDeploymentForm";
import {
  extractParamsFromSchema,
  parseToYAMLNodes,
  setValueee,
  updateCurrentConfigByKey,
} from "./BasicDeploymentForm/TabularSchemaEditorTable/tempSchema";
import { IBasicFormParam2 } from "./BasicDeploymentForm/TabularSchemaEditorTable/tempType";
import DifferentialSelector from "./DifferentialSelector";
import DifferentialTab from "./DifferentialTab";

export interface IDeploymentFormBodyProps {
  deploymentEvent: DeploymentEvent;
  packageId: string;
  packageVersion: string;
  deployedValues?: string;
  packagesIsFetching: boolean;
  selected: IPackageState["selected"];
  appValues: string;
  setValues: (values: string) => void;
  setValuesModified: () => void;
}

function DeploymentFormBody({
  deploymentEvent,
  packageId,
  packageVersion,
  deployedValues: valuesFromTheDeployedPackage,
  packagesIsFetching,
  selected,
  appValues: valuesFromTheParentContainer,
  setValues: setValuesFromTheParentContainer,
  setValuesModified,
}: IDeploymentFormBodyProps) {
  const {
    availablePackageDetail,
    versions,
    schema: schemaFromTheAvailablePackage,
    values: valuesFromTheAvailablePackage,
    pkgVersion,
    error,
  } = selected;

  // Component state
  const [paramsFromComponentState, setParamsFromComponentState] = useState(
    [] as IBasicFormParam2[],
  );
  const [valuesFromTheAvailablePackageNodes, setValuesFromTheAvailablePackageNodes] = useState(
    {} as YAML.Document.Parsed<YAML.ParsedNode>,
  );
  const [valuesFromTheDeployedPackageNodes, setValuesFromTheDeployedPackageNodes] = useState(
    {} as YAML.Document.Parsed<YAML.ParsedNode>,
  );
  const [valuesFromTheParentContainerNodes, setValuesFromTheParentContainerNodes] = useState(
    {} as YAML.Document.Parsed<YAML.ParsedNode>,
  );
  const [restoreModalIsOpen, setRestoreModalOpen] = useState(false);
  const [isLoaded, setIsloaded] = useState(false);
  // const [defaultValues, setDefaultValues] = useState("");

  // setBasicFormParameters when basicFormParameters changes
  useEffect(() => {
    if (
      !isLoaded &&
      schemaFromTheAvailablePackage &&
      Object.keys(valuesFromTheParentContainerNodes).length
    ) {
      const initialParamsFromContainer = extractParamsFromSchema(
        valuesFromTheParentContainerNodes,
        valuesFromTheAvailablePackageNodes,
        schemaFromTheAvailablePackage,
        deploymentEvent,
        valuesFromTheDeployedPackageNodes,
      );
      // if (!isEqual(initialParamsFromContainer, paramsFromComponentState)) {
      console.log("deploymentfrombody.tsx useEffect 1 - initial params extraction");
      setParamsFromComponentState(initialParamsFromContainer);
      setIsloaded(true);
      // }
    }
  }, [
    deploymentEvent,
    isLoaded,
    paramsFromComponentState,
    schemaFromTheAvailablePackage,
    valuesFromTheAvailablePackageNodes,
    valuesFromTheDeployedPackageNodes,
    valuesFromTheParentContainerNodes,
  ]);

  // setDefaultValues when defaultValues changes
  useEffect(() => {
    if (!isLoaded && valuesFromTheAvailablePackage) {
      console.log("deploymentfrombody.tsx useEffect 2 - initial parsing of available package");
      setValuesFromTheAvailablePackageNodes(parseToYAMLNodes(valuesFromTheAvailablePackage));
    } else if (isLoaded && valuesFromTheAvailablePackage) {
      console.log(
        "deploymentfrombody.tsx useEffect 2 - upstream modified -  parsing of available package",
      );
      setValuesFromTheAvailablePackageNodes(parseToYAMLNodes(valuesFromTheAvailablePackage));
    }
  }, [isLoaded, valuesFromTheAvailablePackage]);

  useEffect(() => {
    if (!isLoaded && valuesFromTheParentContainer) {
      console.log(
        "deploymentfrombody.tsx useEffect 3 - initial parsing of values from the parent container",
      );
      setValuesFromTheParentContainerNodes(parseToYAMLNodes(valuesFromTheParentContainer));
    } else if (isLoaded && valuesFromTheParentContainer) {
      console.log(
        "deploymentfrombody.tsx useEffect 3 - the values have been modified upstream, parsing them locally",
      );
      setValuesFromTheParentContainerNodes(parseToYAMLNodes(valuesFromTheParentContainer));
    }
  }, [isLoaded, valuesFromTheParentContainer]);

  useEffect(() => {
    if (!isLoaded && valuesFromTheDeployedPackage) {
      console.log(
        "deploymentfrombody.tsx useEffect 4 - initial parsing of values from the parent container",
      );
      setValuesFromTheDeployedPackageNodes(parseToYAMLNodes(valuesFromTheDeployedPackage));
    } else if (isLoaded && valuesFromTheDeployedPackage) {
      console.log(
        "deploymentfrombody.tsx useEffect 4 - the values have been modified upstream, parsing them locally",
      );
      setValuesFromTheDeployedPackageNodes(parseToYAMLNodes(valuesFromTheDeployedPackage));
    }
  }, [isLoaded, valuesFromTheDeployedPackage, valuesFromTheParentContainer]);

  const handleValuesChange = (value: string) => {
    console.log("deploymentfrombody.tsx handleValuesChange");
    setValuesFromTheParentContainer(value);
    setValuesModified();
  };

  const refreshBasicParameters = () => {
    console.log("deploymentfrombody.tsx refreshBasicParameters");
    if (schemaFromTheAvailablePackage && shouldRenderBasicForm(schemaFromTheAvailablePackage)) {
      setParamsFromComponentState(
        extractParamsFromSchema(
          valuesFromTheParentContainerNodes,
          valuesFromTheAvailablePackageNodes,
          schemaFromTheAvailablePackage,
          deploymentEvent,
          valuesFromTheDeployedPackageNodes,
        ),
      );
    }
  };

  // const handleBasicFormParamChange = (param: IBasicFormParam) => {
  //   // const parsedDefaultValues = parseValues(valuesFromTheAvailablePackage);
  //   return (e: React.FormEvent<any>) => {
  //     // setValuesModified();
  //     // if (parsedDefaultValues !== defaultValues) {
  //     //   setDefaultValues(parsedDefaultValues);
  //     // }
  //     const value = getValueFromEvent(e);
  //     console.log(value);
  //     setBasicFormParameters(
  //       basicFormParameters.map(p => (p.path === param.path ? { ...param, value } : p)),
  //     );
  //     // Change raw values
  //     setValuesFromTheParentContainer(setValue(valuesFromTheParentContainer, param.path, value));
  //   };
  // };

  const handleBasicFormParamChange = useCallback(
    (value: IBasicFormParam2) => {
      console.log("deploymentfrombody.tsx handleBasicFormParamChange");
      return (e: FormEvent<any>) => {
        setValuesModified();
        const newValue = getValueFromEvent(e);
        const newParamsFromComponentState = updateCurrentConfigByKey(
          paramsFromComponentState,
          value.key,
          newValue,
        );
        console.log(`\tLocal param change in ${value.key}: ${newValue}`);
        setParamsFromComponentState([...newParamsFromComponentState]);

        const newValuesFromTheParentContainer = setValueee(
          valuesFromTheParentContainerNodes,
          value.key,
          newValue,
        );
        console.log(`\tValues text change in ${value.key}: ${newValue}`);
        setValuesFromTheParentContainer(newValuesFromTheParentContainer);
      };
    },
    [
      paramsFromComponentState,
      setValuesFromTheParentContainer,
      setValuesModified,
      valuesFromTheParentContainerNodes,
    ],
  );

  // The basic form should be rendered if there are params to show
  const shouldRenderBasicForm = (schema: any) => {
    return schema && Object.keys(schema?.properties).length > 0;
  };

  const closeRestoreDefaultValuesModal = () => {
    setRestoreModalOpen(false);
  };

  const openRestoreDefaultValuesModal = () => {
    setRestoreModalOpen(true);
  };

  const restoreDefaultValues = () => {
    console.log("deploymentfrombody.tsx restoreDefaultValues");
    // // if (valuesFromTheAvailablePackage && schemaFromTheAvailablePackage) {
    setValuesFromTheParentContainer(valuesFromTheAvailablePackage || "");
    if (schemaFromTheAvailablePackage) {
      setParamsFromComponentState(
        extractParamsFromSchema(
          valuesFromTheAvailablePackageNodes,
          valuesFromTheAvailablePackageNodes,
          schemaFromTheAvailablePackage,
          deploymentEvent,
          valuesFromTheDeployedPackageNodes,
        ),
      );
    }
    // }
    setRestoreModalOpen(false);
  };
  if (error) {
    return (
      <Alert theme="danger">
        Unable to fetch package "{packageId}" ({packageVersion}): Got {error.message}
      </Alert>
    );
  }
  if (packagesIsFetching || !availablePackageDetail || !versions.length) {
    return (
      <LoadingWrapper
        className="margin-t-xxl"
        loadingText={`Fetching ${decodeURIComponent(packageId)}...`}
      />
    );
  }
  const tabColumns = [
    "YAML",
    <DifferentialTab
      key="differential-selector"
      deploymentEvent={deploymentEvent}
      defaultValues={valuesFromTheAvailablePackageNodes.toString(toStringOptions)}
      deployedValues={valuesFromTheDeployedPackage || ""}
      appValues={valuesFromTheParentContainer}
    />,
  ] as Array<string | JSX.Element | JSX.Element[]>;
  const tabData = [
    <AdvancedDeploymentForm
      appValues={valuesFromTheParentContainer}
      handleValuesChange={handleValuesChange}
      key="advanced-deployment-form"
    >
      <p>
        <b>Note:</b> Only comments from the original package values will be preserved.
      </p>
    </AdvancedDeploymentForm>,
    <DifferentialSelector
      key="differential-selector"
      deploymentEvent={deploymentEvent}
      defaultValues={valuesFromTheAvailablePackageNodes.toString(toStringOptions)}
      deployedValues={valuesFromTheDeployedPackage || ""}
      appValues={valuesFromTheParentContainer}
    />,
  ];
  if (shouldRenderBasicForm(schemaFromTheAvailablePackage)) {
    tabColumns.unshift(
      <span role="presentation" onClick={refreshBasicParameters}>
        Form
      </span>,
    );
    if (paramsFromComponentState.length && Object.keys(valuesFromTheAvailablePackageNodes).length) {
      tabData.unshift(
        <BasicDeploymentForm
          handleBasicFormParamChange={handleBasicFormParamChange}
          // handleValuesChange={handleValuesChange}
          deploymentEvent={deploymentEvent}
          paramsFromComponentState={paramsFromComponentState}
          // schemaFromTheAvailablePackage={selected.schema}
          // valuesFromTheAvailablePackageNodes={valuesFromTheAvailablePackageNodes}
          // valuesFromTheDeployedPackage={valuesFromTheDeployedPackage}
          // valuesFromTheParentContainer={valuesFromTheParentContainer}
        />,
      );
    } else {
      tabData.unshift(
        <LoadingWrapper loadingText="Fetching parameters from the schema..."></LoadingWrapper>,
      );
    }
  }

  return (
    <div>
      <ConfirmDialog
        modalIsOpen={restoreModalIsOpen}
        loading={false}
        headerText={"Restore defaults"}
        confirmationText={"Are you sure you want to restore the default package values?"}
        confirmationButtonText={"Restore"}
        onConfirm={restoreDefaultValues}
        closeModal={closeRestoreDefaultValuesModal}
      />
      <div className="deployment-form-tabs">
        <Tabs columns={tabColumns} data={tabData} id="deployment-form-body-tabs" />
      </div>
      <div className="deployment-form-control-buttons">
        <CdsButton status="primary" type="submit">
          <CdsIcon shape="deploy" /> Deploy {pkgVersion}
        </CdsButton>
        <CdsButton
          type="button"
          status="primary"
          action="outline"
          onClick={openRestoreDefaultValuesModal}
        >
          <CdsIcon shape="backup-restore" /> Restore Defaults
        </CdsButton>
      </div>
    </div>
  );
}

export default DeploymentFormBody;
