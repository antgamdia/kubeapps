import { CdsButton } from "@cds/react/button";
import { CdsIcon } from "@cds/react/icon";
import actions from "actions";
import ChartSummary from "components/Catalog/ChartSummary";
import Alert from "components/js/Alert";
import Column from "components/js/Column";
import Row from "components/js/Row";
import LoadingWrapper from "components/LoadingWrapper";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as ReactRouter from "react-router";
import { Link } from "react-router-dom";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { IChartState, IStoreState } from "shared/types";
import { app } from "shared/url";
import ChartHeader from "./ChartHeader";
import ChartReadme from "./ChartReadme";

export interface IChartViewProps {
  chartID: string;
  chartNamespace: string;
  isFetching: boolean;
  selected: IChartState["selected"];
  namespace: string;
  cluster: string;
  version: string | undefined;
  kubeappsNamespace: string;
}

interface IRouteParams {
  cluster: string;
  namespace: string;
  repo: string;
  global: string;
  id: string;
  version?: string;
}

export default function ChartView() {
  const dispatch: ThunkDispatch<IStoreState, null, Action> = useDispatch();
  const {
    cluster,
    namespace,
    repo,
    global,
    id,
    version: queryVersion,
  } = ReactRouter.useParams() as IRouteParams;
  const {
    config,
    charts: { isFetching, selected },
  } = useSelector((state: IStoreState) => state);
  const { readme, error, readmeError, versions } = selected;

  const chartID = `${repo}/${id}`;
  const chartNamespace = global === "global" ? config.kubeappsNamespace : namespace;
  const kubeappsNamespace = config.kubeappsNamespace;

  const history = ReactRouter.useHistory();
  const location = ReactRouter.useLocation();

  // Fetch the selected/latest version on the initial load
  useEffect(() => {
    dispatch(actions.charts.fetchChartVersion(cluster, chartNamespace, chartID, queryVersion));
    return () => {};
  }, [dispatch, chartID, chartNamespace, cluster, queryVersion]);

  // Fetch all versions
  useEffect(() => {
    dispatch(actions.charts.fetchChartVersions(cluster, chartNamespace, chartID));
  }, [dispatch, chartID, chartNamespace, cluster]);

  // Select version handler
  const selectVersion = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const versionRegex = /\/versions\/(.*)/;
    if (versionRegex.test(location.pathname)) {
      // If the current URL already has the version, replace it
      history.push(location.pathname.replace(versionRegex, `/versions/${event.target.value}`));
    } else {
      // Otherwise, append the version
      history.push(location.pathname.concat(`/versions/${event.target.value}`));
    }
  };

  if (error) {
    return <Alert theme="danger">Unable to fetch chart: {error.message}</Alert>;
  }
  if (isFetching || !selected.version) {
    return <LoadingWrapper loaded={false} />;
  }

  return (
    <section>
      <div>
        <ChartHeader
          chartAttrs={selected.version}
          versions={versions}
          onSelect={selectVersion}
          deployButton={
            <Link
              to={app.apps.new(
                cluster,
                namespace,
                selected.version,
                selected.version.pkgVersion,
                kubeappsNamespace,
              )}
            >
              <CdsButton status="primary">
                <CdsIcon shape="deploy" /> Deploy
              </CdsButton>
            </Link>
          }
          selectedVersion={selected.version?.pkgVersion}
        />
      </div>

      <section>
        <Row>
          <Column span={3}>
            <ChartSummary version={selected.version} chartAttrs={selected.version} />
          </Column>
          <Column span={9}>
            <ChartReadme
              readme={readme}
              error={readmeError}
              version={selected.version.pkgVersion}
              cluster={cluster}
              namespace={chartNamespace}
              chartID={chartID}
            />
            <div className="after-readme-button">
              <Link
                to={app.apps.new(
                  cluster,
                  namespace,
                  selected.version,
                  selected.version.pkgVersion,
                  kubeappsNamespace,
                )}
              >
                <CdsButton status="primary">
                  <CdsIcon shape="deploy" /> Deploy
                </CdsButton>
              </Link>
            </div>
          </Column>
        </Row>
      </section>
    </section>
  );
}
