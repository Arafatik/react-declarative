import * as React from 'react';
import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';

import deepFlat from '../../utils/deepFlat';
import getNamespaces from '../../utils/getNamespaces';
import removeDuplicates from '../../utils/removeDuplicates';
import replaceString from '../../utils/replaceString';

import IData from '../../model/IData';

import isObject from '../../../../utils/isObject';
import create from '../../../../utils/create';
import get from '../../../../utils/get';
import set from '../../../../utils/set';
import keyToTitle from '../../utils/keyToTitle';
import countDots from '../../utils/countDots';

import useActualCallback from '../../../../hooks/useActualCallback';
import useActualValue from '../../../../hooks/useActualValue';

const SearchContext = createContext<Context>(null as never);

export interface Context {
  data: IData;
  search: string;
  setSearch: (search: string) => void;
  isChecked: (path: string) => boolean;
  setIsChecked: (path: string, checked: boolean) => void;
}

export interface State {
  search: string;
  data: IData;
  checked: Set<string>;
}

export interface Props {
  data: IData;
  search: string;
  withExpandAll: boolean;
  withExpandRoot: boolean;
  withExpandLevel: number;
  expandList?: string[];
  children: React.ReactNode;
  onSearchChanged?: (search: string) => void;
}

export interface Hook extends Omit<Context, keyof {
  checked: never;
}> {
  isSearching: boolean;
}

export const SearchProvider = ({
  children,
  search: initialSearch = '',
  withExpandAll = false,
  withExpandRoot = false,
  withExpandLevel = 0,
  expandList,
  data: upperData,
  onSearchChanged = () => undefined,
}: Props) => {

  const onSearchChanged$ = useActualCallback(onSearchChanged);

  const getExpandAllNamespaces = useCallback(
    () =>
      deepFlat(upperData)
        .map(({ path }) =>
          path.startsWith("root.") ? path.slice(5) : path
        )
        .filter((path) => path !== "root")
        .filter((path) => {
          const value = get(upperData, path);
          return isObject(value);
        }),
    [upperData]
  );

  const getExpandRootNamespaces = useCallback(
    () =>
      deepFlat(upperData)
        .map(({ path }) =>
          path.startsWith('root.') ? path.replace('root.', '') : path,
        )
        .filter((path) => path !== "root")
        .filter((path) => {
          const value = get(upperData, path);
          let isOk = true;
          isOk = isOk && isObject(value);
          isOk = isOk && !path.includes('.');
          return isOk;
        }),
    [upperData],
  );

  const getExpandLevelNamespaces = useCallback(
    () =>
      deepFlat(upperData)
        .map(({ path }) =>
          path.startsWith('root.') ? path.replace('root.', '') : path,
        )
        .filter((path) => path !== "root")
        .filter((path) => {
          const value = get(upperData, path);
          let isOk = true;
          isOk = isOk && isObject(value);
          isOk = isOk && countDots(path) <= withExpandLevel;
          return isOk;
        }),
    [upperData, withExpandLevel],
  );

  const getInitialExpand = useCallback(() => {
    if (withExpandAll) {
      return getExpandAllNamespaces();
    }
    if (withExpandRoot) {
      return getExpandRootNamespaces();
    }
    if (withExpandLevel) {
      return getExpandLevelNamespaces();
    }
    if (expandList) {
      return expandList.map((path) =>
        path.startsWith('root.') ? path.replace('root.', '') : path,
      );
    }
    return [];
  }, [
    withExpandAll,
    withExpandRoot,
    withExpandLevel,
    getExpandAllNamespaces,
    getExpandRootNamespaces,
    getExpandLevelNamespaces,
    expandList,
  ]);

  const [state, setState] = useState<State>(() => ({
    checked: new Set(getInitialExpand()),
    data: upperData,
    search: initialSearch,
  }));

  const state$ = useActualValue(state);

  useEffect(() => {
    if (!state$.current.search && expandList) {
      setState((prevState) => ({
        ...prevState,
        checked: new Set(getInitialExpand()),
      }));
    }
  }, [expandList]);

  useEffect(() => {
    const data: IData = {};
    const rawNamespaces = deepFlat(upperData)
      .map(({ value, path }) => ({
        path: path.startsWith('root.') ? path.replace('root.', '') : path,
        value,
      }))
      .filter(({ value, path }) => {
        const search = state.search.toLowerCase();
        let isOk = false;
        isOk = isOk || value.toLowerCase().includes(search);
        isOk = isOk || path.toLowerCase().includes(search);
        isOk = isOk || keyToTitle(replaceString(path, '.', ' ')).toLowerCase().includes(search);
        return isOk;
      })
      .flatMap(({ path }) => getNamespaces(path));
    const namespaces = removeDuplicates(rawNamespaces).filter(
      (path) => path !== "root"
    );
    namespaces.forEach((path) => {
      const value = get(upperData, path);
      if (!isObject(value)) {
        create(data, path);
        set(data, path, value);
      }
    });
    setState((prevState) => ({ ...prevState, data }));
  }, [state.search, upperData]);

  useEffect(() => {
    onSearchChanged$(state.search);
  }, [state.search, onSearchChanged$]);

  const setSearch = useCallback(
    (search: string) => setState((prevState) => ({ ...prevState, search })),
    []
  );

  const isChecked = useCallback(
    (path: string) => {
      const normalPath = path.startsWith('root.')
        ? path.replace('root.', '')
        : path;
      return state.checked.has(normalPath);
    },
    [state.checked]
  );

  const setIsChecked = useCallback(
    (path: string, checked: boolean) => {
      const normalPath = path.startsWith('root.')
        ? path.replace('root.', '')
        : path;
      if (checked) {
        state.checked.add(normalPath);
      } else {
        state.checked.delete(normalPath);
      }
      setState((prevState) => ({
        ...prevState,
        checked: new Set(state.checked),
      }));
    },
    [state.checked]
  );

  const context = useMemo(
    (): Context => ({
      data: state.data,
      search: state.search,
      setSearch,
      isChecked,
      setIsChecked,
    }),
    [state, isChecked, setSearch, setIsChecked]
  );

  return (
    <SearchContext.Provider value={context}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): Hook => {
  const { search, ...other } = useContext(SearchContext);
  return {
    isSearching: !!search,
    search,
    ...other,
  };
};

export default useSearch;
