import { useMemo } from "react";
import { getIcon } from "shared/Operators";
import { IAvailablePackagesSummary, IClusterServiceVersion, IRepo } from "shared/types";
import CatalogItem, { ICatalogItemProps } from "./CatalogItem";

interface ICatalogItemsProps {
  charts: IAvailablePackagesSummary[];
  csvs: IClusterServiceVersion[];
  cluster: string;
  namespace: string;
  page: number;
  isFetching: boolean;
  hasFinishedFetching: boolean;
}

export default function CatalogItems({
  charts,
  csvs,
  cluster,
  namespace,
  page,
  isFetching,
  hasFinishedFetching,
}: ICatalogItemsProps) {
  console.log(charts);
  const chartItems: ICatalogItemProps[] = useMemo(
    () =>
      charts.map(c => {
        console.log(c);
        const obj = {
          type: "chart",
          id: `chart/${c.availablePackageRef.identifier}`,
          item: {
            id: `chart/${c.availablePackageRef.identifier}/${c.latestPkgVersion}`,
            name: c.displayName,
            icon: c.iconUrl ? c.iconUrl : undefined,
            version: c.latestPkgVersion,
            description: c.shortDescription,
            repo: { name: "NOT AVAILABLE" } as IRepo,
            cluster,
            namespace,
          },
        };
        console.log(obj);
        return obj;
      }),
    [charts, cluster, namespace],
  );
  const crdItems: ICatalogItemProps[] = useMemo(
    () =>
      csvs
        .map(csv => {
          if (csv.spec.customresourcedefinitions?.owned) {
            return csv.spec.customresourcedefinitions.owned.map(crd => {
              return {
                type: "operator",
                id: `operator/${csv.metadata.name}/${crd.name}`,
                item: {
                  id: crd.name,
                  name: crd.displayName || crd.name,
                  icon: getIcon(csv),
                  version: crd.version,
                  description: crd.description,
                  csv: csv.metadata.name,
                  cluster,
                  namespace,
                },
              };
            });
          } else {
            return [];
          }
        })
        .flat(),
    [csvs, cluster, namespace],
  );

  const sortedItems =
    isFetching && page === 1
      ? []
      : chartItems
          .concat(crdItems)
          .sort((a, b) => (a.item.name.toLowerCase() > b.item.name.toLowerCase() ? 1 : -1));

  if (hasFinishedFetching && sortedItems.length === 0) {
    return <p>No application matches the current filter.</p>;
  }
  return (
    <>
      {sortedItems.map(i => (
        <CatalogItem key={i.id} {...i} />
      ))}
    </>
  );
}
