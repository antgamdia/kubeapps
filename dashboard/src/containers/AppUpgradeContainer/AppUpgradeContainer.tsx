import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import AppUpgrade from "../../components/AppUpgrade";
import { IStoreState } from "../../shared/types";

interface IRouteProps {
  match: {
    params: {
      cluster: string;
      namespace: string;
      releaseName: string;
    };
  };
}

function mapStateToProps(
  { apps, charts, config, repos }: IStoreState,
  { match: { params } }: IRouteProps,
) {
  return {
    app: apps.selected,
    appsIsFetching: apps.isFetching,
    chartsIsFetching: charts.isFetching,
    reposIsFetching: repos.isFetching,
    error: apps.error,
    chartsError: charts.selected.error,
    kubeappsNamespace: config.kubeappsNamespace,
    namespace: params.namespace,
    cluster: params.cluster,
    releaseName: params.releaseName,
    repo: repos.repo,
    repoError: repos.errors.fetch,
    repos: repos.repos,
    selected: charts.selected,
    deployed: charts.deployed,
    repoName:
      (repos.repo.metadata && repos.repo.metadata.name) ||
      (apps.selected && apps.selected.updateInfo && apps.selected.updateInfo.repository.name),
    repoNamespace:
      (repos.repo.metadata && repos.repo.metadata.namespace) ||
      (apps.selected && apps.selected.updateInfo && apps.selected.updateInfo.repository.namespace),
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<IStoreState, null, Action>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(AppUpgrade);
