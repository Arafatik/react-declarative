import { Key, pathToRegexp } from "path-to-regexp";

import { ISwitchItem } from './getRouteParams';

export const getRouteItem = <T extends ISwitchItem = ISwitchItem>(routes: T[], pathname: string): T | null => {
    for (const route of routes) {
        const { path = "/" } = route;
        const keys: Key[] = [];
        const reg = pathToRegexp(path, keys);
        const match = reg.test(pathname);
        if (match) {
            return route;
        }
    }
    return null;
};

export default getRouteItem;
