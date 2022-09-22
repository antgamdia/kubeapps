// Copyright 2019-2022 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import { CdsButton } from "@cds/react/button";
import { CdsControlMessage } from "@cds/react/forms";
import { CdsIcon } from "@cds/react/icon";
import Alert from "components/js/Alert";
import Tabs from "components/Tabs";
import _ from "lodash";
import { FormEvent, RefObject, useCallback, useEffect, useState } from "react";
import YAML from "yaml";
import { DeploymentEvent, IBasicFormParam2, IPackageState } from "../../shared/types";
import { getValueFromEvent } from "../../shared/utils";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import LoadingWrapper from "../LoadingWrapper/LoadingWrapper";
import AdvancedDeploymentForm2 from "./AdvancedDeploymentForm2";
import BasicDeploymentForm from "./BasicDeploymentForm/BasicDeploymentForm";
import {
  extractParamsFromSchema,
  parseToYAMLNodes,
  setValueee,
  updateCurrentConfigByKey,
} from "./BasicDeploymentForm/TabularSchemaEditorTable/tempSchema";

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
  formRef: RefObject<HTMLFormElement>;
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
  formRef,
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
  const [isLoading, setIsloading] = useState(true);
  const [unsavedChangesMap] = useState(new Map<string, any>());
  const [shouldForceSubmit, setShouldForceSubmit] = useState(false);

  // setBasicFormParameters when basicFormParameters changes
  useEffect(() => {
    if (
      !isLoaded &&
      schemaFromTheAvailablePackage &&
      !_.isEmpty(valuesFromTheParentContainerNodes)
    ) {
      const initialParamsFromContainer = extractParamsFromSchema(
        valuesFromTheParentContainerNodes,
        valuesFromTheAvailablePackageNodes,
        schemaFromTheAvailablePackage,
        deploymentEvent,
        valuesFromTheDeployedPackageNodes,
      );
      setParamsFromComponentState(initialParamsFromContainer);
      setIsloaded(true);
      setIsloading(false);
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
    if (valuesFromTheAvailablePackage) {
      setValuesFromTheAvailablePackageNodes(parseToYAMLNodes(valuesFromTheAvailablePackage));
    }
  }, [isLoaded, valuesFromTheAvailablePackage]);

  useEffect(() => {
    if (valuesFromTheParentContainer) {
      setValuesFromTheParentContainerNodes(parseToYAMLNodes(valuesFromTheParentContainer));
    }
  }, [isLoaded, valuesFromTheParentContainer]);

  useEffect(() => {
    if (valuesFromTheDeployedPackage) {
      setValuesFromTheDeployedPackageNodes(parseToYAMLNodes(valuesFromTheDeployedPackage));
    }
  }, [isLoaded, valuesFromTheDeployedPackage, valuesFromTheParentContainer]);

  const handleYAMLEditorChange = (value: string) => {
    setValuesFromTheParentContainer(value);
    setValuesModified();
  };

  const forceSubmit = useCallback(() => {
    // the API was added recently, but should replace the manual dispatch of a submit event with bubbles:true (react>=17)
    formRef?.current?.requestSubmit();
  }, [formRef]);

  // if this flag is set, force the submit of the form
  useEffect(() => {
    if (shouldForceSubmit) {
      forceSubmit();
      setShouldForceSubmit(false);
    }
  }, [forceSubmit, shouldForceSubmit]);

  const saveAllChanges = () => {
    let newValuesFromTheParentContainer, newParamsFromComponentState;
    unsavedChangesMap.forEach((value, key) => {
      setIsloading(true);
      setValuesModified();
      const aa = updateCurrentConfigByKey(paramsFromComponentState, key, value);
      newParamsFromComponentState = [...aa];
      setParamsFromComponentState(newParamsFromComponentState);

      newValuesFromTheParentContainer = setValueee(valuesFromTheParentContainerNodes, key, value);
      setValuesFromTheParentContainer(newValuesFromTheParentContainer);
    });
    unsavedChangesMap.clear();
    setIsloading(false);
  };

  // save the pending changes and fire the submit event (via useEffect, to actually get the saved changes)
  const handleDeployClick = () => {
    saveAllChanges();
    setShouldForceSubmit(true);
  };

  // re-build the table based on the new YAML
  const refreshBasicParameters = () => {
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

  // a change in the table is just a new entry in the unsavedChangesMap for performance reasons
  // later on, the changes will be saved in bulk
  const handleTableChange = useCallback(
    (value: IBasicFormParam2) => {
      return (e: FormEvent<any>) => {
        unsavedChangesMap.set(value.key, getValueFromEvent(e));
      };
    },
    [unsavedChangesMap],
  );

  // The basic form should be rendered if there are params to show
  const shouldRenderBasicForm = (schema: any) => {
    return !_.isEmpty(schema.properties);
  };

  const closeRestoreDefaultValuesModal = () => {
    setRestoreModalOpen(false);
  };

  const openRestoreDefaultValuesModal = () => {
    setRestoreModalOpen(true);
  };

  const restoreDefaultValues = () => {
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
    setRestoreModalOpen(false);
  };

  // early return if error
  if (error) {
    return (
      <Alert theme="danger">
        Unable to fetch package "{packageId}" ({packageVersion}): Got {error.message}
      </Alert>
    );
  }

  // early return if loading
  if (
    packagesIsFetching ||
    !availablePackageDetail ||
    (!versions.length &&
      shouldRenderBasicForm(schemaFromTheAvailablePackage) &&
      !_.isEmpty(paramsFromComponentState) &&
      !_.isEmpty(valuesFromTheAvailablePackageNodes))
  ) {
    return (
      <LoadingWrapper
        className="margin-t-xxl"
        loadingText={`Fetching ${decodeURIComponent(packageId)}...`}
      />
    );
  }

  // creation of the each tab + its content
  const tabColumns: JSX.Element[] = [];
  const tabData: JSX.Element[] = [];

  // Basic form creation
  if (shouldRenderBasicForm(schemaFromTheAvailablePackage)) {
    tabColumns.push(
      <div role="presentation" onClick={refreshBasicParameters}>
        <span>Visual editor</span>
      </div>,
    );
    tabData.push(
      <>
        <BasicDeploymentForm
          handleBasicFormParamChange={handleTableChange}
          deploymentEvent={deploymentEvent}
          paramsFromComponentState={paramsFromComponentState}
          isLoading={isLoading}
          saveAllChanges={saveAllChanges}
        />
      </>,
    );
  }

  // Text editor creation
  tabColumns.push(
    <div role="presentation" onClick={saveAllChanges}>
      <span>YAML editor</span>
    </div>,
  );
  tabData.push(
    <AdvancedDeploymentForm2
      valuesFromTheParentContainer={valuesFromTheParentContainer}
      deploymentEvent={deploymentEvent}
      valuesFromTheAvailablePackage={valuesFromTheAvailablePackage || ""}
      valuesFromTheDeployedPackage={valuesFromTheDeployedPackage || ""}
      handleValuesChange={handleYAMLEditorChange}
      key="advanced-deployment-form"
    ></AdvancedDeploymentForm2>,
  );

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
        <CdsControlMessage>
          The unsaved changes will be applied before deploying or visualizing the diff view.
        </CdsControlMessage>
      </div>
      <div className="deployment-form-control-buttons">
        <CdsButton status="primary" type="button" onClick={handleDeployClick}>
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
