import {
  GetAvailablePackageDetailResponse,
  GetAvailablePackageSummariesResponse,
  GetAvailablePackageVersionsResponse,
} from "gen/kubeappsapis/core/packages/v1alpha1/packages";
import { JSONSchema4 } from "json-schema";
import { axiosWithAuth } from "./AxiosInstance";
import { KubeappsGrpcClient } from "./KubeappsGrpcClient";
import { IChart } from "./types";
import * as URL from "./url";

export default class Chart {
  // TODO(agamez): move to the core 'PackagesServiceClientImpl' when pagination is ready there
  private static client = new KubeappsGrpcClient().getHelmPackagesServiceClientImpl();

  public static async getAvailablePackageSummaries(
    cluster: string,
    namespace: string,
    repos: string,
    page: number,
    size: number,
    query?: string,
  ): Promise<GetAvailablePackageSummariesResponse> {
    return await this.client.GetAvailablePackageSummaries({
      // TODO(agamez): add cluster when it is supported
      context: { cluster: "", namespace: namespace },
      filterOptions: {
        query: query,
        repositories: repos.split(","),
      },
      paginationOptions: { pageSize: size, pageToken: page.toString() },
    });
  }

  // public static async fetchChartVersions(
  //   cluster: string,
  //   namespace: string,
  //   id: string,
  // ): Promise<void> {
  //   const { data } = await axiosWithAuth.get<{ data: GetAvailablePackageVersionsResponse_PackageAppVersion[] }>(
  //     URL.api.charts.listVersions(cluster, namespace, id),
  //   );
  //   return data.data;
  // }

  public static async getAvailablePackageVersions(
    cluster: string,
    namespace: string,
    id: string,
  ): Promise<GetAvailablePackageVersionsResponse> {
    return await this.client.GetAvailablePackageVersions({
      availablePackageRef: {
        // TODO(agamez): add cluster when it is supported
        context: { cluster: "", namespace: namespace },
        identifier: id,
      },
    });
  }

  public static async getAvailablePackageDetail(
    cluster: string,
    namespace: string,
    id: string,
    version?: string,
  ): Promise<GetAvailablePackageDetailResponse> {
    return await this.client.GetAvailablePackageDetail({
      pkgVersion: version,
      availablePackageRef: {
        context: { cluster: "", namespace: namespace },
        identifier: id,
      },
    });
  }

  // public static async getChartVersion(
  //   cluster: string,
  //   namespace: string,
  //   id: string,
  //   version: string,
  // ) {
  //   const { data } = await axiosWithAuth.get<{
  //     data: GetAvailablePackageVersionsResponse_PackageAppVersion;
  //   }>(URL.api.charts.getVersion(cluster, namespace, id, version));
  //   return data.data;
  // }

  public static async getReadme(cluster: string, namespace: string, id: string, version: string) {
    const { data } = await axiosWithAuth.get<string>(
      URL.api.charts.getReadme(cluster, namespace, id, version),
    );
    return data;
  }

  public static async getValues(cluster: string, namespace: string, id: string, version: string) {
    const { data } = await axiosWithAuth.get<string>(
      URL.api.charts.getValues(cluster, namespace, id, version),
    );
    return data;
  }

  public static async getSchema(cluster: string, namespace: string, id: string, version: string) {
    const { data } = await axiosWithAuth.get<JSONSchema4>(
      URL.api.charts.getSchema(cluster, namespace, id, version),
    );
    return data;
  }

  public static async listWithFilters(
    cluster: string,
    namespace: string,
    name: string,
    version: string,
    appVersion: string,
  ) {
    const url = `${URL.api.charts.base(cluster, namespace)}/charts?name=${encodeURIComponent(
      name,
    )}&version=${encodeURIComponent(version)}&appversion=${appVersion}`;
    const { data } = await axiosWithAuth.get<{ data: IChart[] }>(url);
    return data.data;
  }
}
