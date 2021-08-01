import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import DeploymentForm from "../../components/DeploymentForm";
import { IStoreState } from "../../shared/types";

interface IRouteProps {
  match: {
    params: {
      cluster: string;
      namespace: string;
      repo: string;
      global: string;
      id: string;
      version: string;
    };
  };
}

function mapStateToProps(
  { apps, charts, config }: IStoreState,
  { match: { params } }: IRouteProps,
) {
  return {
    chartID: `${params.repo}/${params.id}`,
    chartNamespace: params.global === "global" ? config.kubeappsNamespace : params.namespace,
    cluster: params.cluster,
    chartVersion: params.version,
    error: apps.error || charts.selected.error,
    kubeappsNamespace: config.kubeappsNamespace,
    namespace: params.namespace,
    selected: charts.selected,
    chartsIsFetching: charts.isFetching,
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<IStoreState, null, Action>) {
  return {
    // deployChart: (
    //   targetCluster: string,
    //   targetNamespace: string,
    //   availablePackageDetail: AvailablePackageDetail,
    //   releaseName: string,
    //   values?: string,
    //   schema?: any,
    // ) =>
    //   dispatch(
    //     actions.apps.deployChart(
    //       targetCluster,
    //       targetNamespace,
    //       availablePackageDetail,
    //       releaseName,
    //       values,
    //       schema,
    //     ),
    //   ),
    // push: (location: string) => dispatch(push(location)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentForm);
