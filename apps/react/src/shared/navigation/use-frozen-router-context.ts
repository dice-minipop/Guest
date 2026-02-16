import cloneDeep from "lodash-es/cloneDeep";

import type { BuildNextOptions, ParsedLocation } from "@tanstack/router-core";

type RouterOptionsLike = { context?: unknown; routesById?: unknown };
export type RouterLike = {
  options?: RouterOptionsLike;
  routesById?: unknown;
  routeTree?: unknown;
  buildLocation: (opts?: BuildNextOptions, matchedRoutesResult?: unknown) => ParsedLocation;
};

type SnapshotOptions = {
  location?: ParsedLocation;
};

const preserveOptionsContext = (snapshot: RouterLike, original: RouterLike) => {
  if (snapshot?.options && original?.options) {
    snapshot.options = {
      ...snapshot.options,
      context: original.options.context,
    };
  }
};

export function snapshotRouterContext<T extends RouterLike>(
  liveRouter: T,
  options?: SnapshotOptions
): T {
  const snapshot = cloneDeep(liveRouter) as T;
  preserveOptionsContext(snapshot, liveRouter);

  if (liveRouter?.routesById) {
    (snapshot as RouterLike).routesById = liveRouter.routesById;
  }
  if (liveRouter?.options?.routesById) {
    (snapshot as RouterLike).options = {
      ...((snapshot as RouterLike).options || {}),
      routesById: liveRouter.options?.routesById,
    };
  }
  if (liveRouter?.routeTree) {
    (snapshot as RouterLike).routeTree = liveRouter.routeTree;
  }

  const fromLocation = options?.location ?? liveRouter.buildLocation();

  if (fromLocation) {
    const originalBuildLocation = snapshot.buildLocation.bind(snapshot);
    snapshot.buildLocation = (opts?: BuildNextOptions, matchedRoutesResult?: unknown) => {
      const nextOpts = typeof opts === "object" ? { ...opts, _fromLocation: fromLocation } : opts;
      return originalBuildLocation(nextOpts, matchedRoutesResult);
    };
  }

  return snapshot;
}
