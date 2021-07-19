import * as React from "react";

import { DataGrid } from "@material-ui/data-grid";

import IListProps, { IListState, IListCallbacks } from '../../../../model/IListProps';
import IAnything from '../../../../model/IAnything';
import IRowData from '../../../../model/IRowData';

import SelectionMode from "../../../../model/SelectionMode";

import Container from "../Container";

import Checkbox from "./components/CheckBox";
import DefaultHeader from "./components/Header";
import DefaultColumnMenu from "./components/ColumnMenu";

import createColumn from "../../../../config/createColumn";

interface IDesktopProps<FilterData = IAnything, RowData extends IRowData = IAnything> extends
  IListProps<FilterData, RowData>,
  IListState<FilterData, RowData>,
  IListCallbacks<FilterData, RowData> {
  className?: string;
  style?: React.CSSProperties;
  rowHeight: number;
}

export const Desktop = <
  FilterData extends IAnything = IAnything,
  RowData extends IRowData = IAnything,
>(props: IDesktopProps<FilterData, RowData>) => {

  const {
    className,
    style,
    filters = [],
    columns = [],
    actions = [],
    heightRequest = (v) => v,
    widthRequest = (v) => v,
    handler = () => [],
    rowHeight,
    filterData,
    handleFilter,
    handleDefault,
    initComplete,
    rows,
    disableSelectionOnClick,
    onRowSelected,
    onRowClick,
    selectionMode,
    ...otherProps
  } = props;

  const {
    ColumnMenu,
    ErrorOverlay,
    Footer,
    Header,
    Toolbar,
    PreferencesPanel,
    LoadingOverlay,
    NoResultsOverlay,
    NoRowsOverlay,
    Pagination,
    FilterPanel,
    ColumnsPanel,
    Panel,
    columnMenuProps,
    errorOverlayProps,
    footerProps,
    headerProps,
    toolbarProps,
    preferencesPanelProps,
    loadingOverlayProps,
    noResultsOverlayProps,
    noRowsOverlayProps,
    paginationProps,
    filterPanelProps,
    columnsPanelProps,
    panelProps,
    ...gridProps
  } = otherProps;

  return (
    <Container<FilterData, RowData>
      {...props}
    >
      {() => (
        <DataGrid
          {...gridProps}
          checkboxSelection={selectionMode !== SelectionMode.None}
          disableSelectionOnClick={disableSelectionOnClick}
          columns={props.gridColumns || columns.map(createColumn)}
          onRowSelected={onRowSelected}
          onRowClick={onRowClick}
          rows={rows}
          components={{
            Header: Header || DefaultHeader,
            ColumnMenu: ColumnMenu || DefaultColumnMenu,
            Checkbox,
            ErrorOverlay,
            Footer,
            Toolbar,
            PreferencesPanel,
            LoadingOverlay,
            NoResultsOverlay,
            NoRowsOverlay,
            Pagination,
            FilterPanel,
            ColumnsPanel,
            Panel,
          }}
          componentsProps={{
            columnMenu: columnMenuProps,
            errorOverlay: errorOverlayProps,
            footer: footerProps,
            header: headerProps,
            toolbar: toolbarProps,
            preferencesPanel: preferencesPanelProps,
            loadingOverlay: loadingOverlayProps,
            noResultsOverlay: noResultsOverlayProps,
            noRowsOverlay: noRowsOverlayProps,
            pagination: paginationProps,
            filterPanel: filterPanelProps,
            columnsPanel: columnsPanelProps,
            panel: panelProps,
          }}
          rowHeight={rowHeight}
        />
      )}
    </Container>
  );
};

export default Desktop;
