import { useMemo } from "react";
import { useRouteMatch as useDefaultRouteMatch, match as MatchType } from "react-router";

function pop<T = {}>(match: MatchType<T>, count = 1) {
  if (!match) {
    return match;
  }
  const splittedUrl = match.url.split("/").filter(Boolean);
  const splittedPath = match.path.split("/").filter(Boolean);
  for (let i = count; i > 0; i--) {
    splittedUrl.pop();
    splittedPath.pop();
  }
  const res = {
    ...match,
    path: "/" + splittedPath.join("/"),
    url: "/" + splittedUrl.join("/"),
  };
  return res;
}

/**
 * Customized react-router hook. Extended by pop method.
 * Pop method converts `/something/2/boo` => `/something/2`.
 * how to use: match.pop().pop();
 * how to use: match.pop(2);
 * @example
 * // /something/2/boo
 * match.pop(2);
 * // /something
 */
export function useRouteMatch<T = {}>() {
  const match = useDefaultRouteMatch<T>();
  return useMemo(
    () => ({
      ...match,
      pop: (count?: number) => pop(match, count),
    }),
    [match],
  );
}
