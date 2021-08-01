import qs from "qs";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import Catalog from "../../components/Catalog";
import { IStoreState } from "../../shared/types";

function mapStateToProps(
  { charts, operators, config }: IStoreState,
  {
    match: { params },
    location,
  }: RouteComponentProps<{ cluster: string; namespace: string; repo: string }>,
) {
  return {
    charts,
    filter: qs.parse(location.search, { ignoreQueryPrefix: true }),
    repos: params.repo,
    csvs: operators.csvs,
    cluster: params.cluster,
    namespace: params.namespace,
    kubeappsNamespace: config.kubeappsNamespace,
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<IStoreState, null, Action>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Catalog);
