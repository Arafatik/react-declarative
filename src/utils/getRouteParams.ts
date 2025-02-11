import { Key, pathToRegexp } from "path-to-regexp";

export interface ISwitchItem {
    path: string;
}

export const getRouteParams = <T = Record<string, any>>(routes: ISwitchItem[], pathname: string): T | null => {
    for (const { path } of routes) {
        const params = {} as T;
        const keys: Key[] = [];
        const reg = pathToRegexp(path, keys);
        const match = reg.test(pathname);
        if (match) {
            const tokens = reg.exec(pathname);
            tokens && keys.forEach((key, i) => {
                params[key.name] = tokens[i + 1];
            });
            return params;
        }
    }
    return null;
};

export default getRouteParams;
