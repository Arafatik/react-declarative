import React from 'react';
import { createContext, useContext } from "react";

export const createValueProvider = <P extends any = object>() => {

  const Context = createContext<P>(null as never);

  const Provider = ({
    children,
    payload,
  }: {
    children: React.ReactNode;
    payload: P;
  }) => (
    <Context.Provider value={payload}>
      {children}
    </Context.Provider>
  );

  const usePayload = () => useContext(Context);

  return [Provider, usePayload] as const;
};

export default createValueProvider;
