import * as React from "react";

import { SearchProvider } from "./context/SearchContext";

import Container from "./components/Container";

import IData from "./model/IData";
import IRecordViewProps from "./model/IRecordViewProps";

import keyToTitle from "./utils/keyToTitle";

export const RecordView = <Data extends any = IData>({
  data = {} as Data,
  formatValue = (_, value) => value,
  formatKey = (key) => `${keyToTitle(key)}: `,
  withExpandAll = false,
  withExpandRoot = false,
  withExpandLevel = 0,
  keyWidth = 2,
  valueWidth = 10,
  totalWidth,
  ...otherProps
}: IRecordViewProps<Data>) => (
  <SearchProvider
    data={data as IData}
    withExpandAll={withExpandAll}
    withExpandRoot={withExpandRoot}
    withExpandLevel={withExpandLevel}
  >
    <Container
      formatValue={formatValue}
      formatKey={formatKey}
      keyWidth={keyWidth}
      valueWidth={valueWidth}
      totalWidth={totalWidth}
      {...otherProps}
    />
  </SearchProvider>
);

export default RecordView;
