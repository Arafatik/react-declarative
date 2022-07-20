import {
  Ref,
} from 'react';

import ActionType from './ActionType';
import SelectionMode from './SelectionMode';

import IAnything from './IAnything';
import IRowData, { RowId } from './IRowData';
import IColumn from './IColumn';
import IListOperation from './IListOperation';
import IListRowAction from './IListRowAction';
import IField from './IField';
import IListApi from './IListApi';
import IOption from './IOption';

interface IUpdateOption<RowData extends IRowData = IAnything> extends Omit<IListActionOption<RowData>, keyof {
  label: never;
  icon: never;
}> {
  action: 'update-now';
  label?: IOption['label'];
  icon?: IOption['icon'];
};

interface IResortOption<RowData extends IRowData = IAnything> extends Omit<IListActionOption<RowData>, keyof {
  label: never;
  icon: never;
}> {
  action: 'resort-action';
  label?: IOption['label'];
  icon?: IOption['icon'];
}

export interface IListActionOption<RowData extends IRowData = IAnything> extends Omit<IOption, keyof {
  isVisible: never;
  isDisabled: never;
}> {
  isVisible?: (selectedRows: RowData[]) => Promise<boolean> | boolean;
  isDisabled?: (selectedRows: RowData[]) => Promise<boolean> | boolean;
};

export interface IListAction<RowData extends IRowData = IAnything> {
  type: ActionType;
  action?: string;
  label?: string;
  isVisible?: (selectedRows: RowData[]) => Promise<boolean> | boolean;
  isDisabled?: (selectedRows: RowData[]) => Promise<boolean> | boolean;
  icon?: React.ComponentType<any>;
  options?: (IListActionOption<RowData> | IUpdateOption<RowData> | IResortOption<RowData>)[];
}

export interface IListChip<RowData extends IRowData = IAnything> {
  name: keyof RowData,
  label: string;
  color?: string;
  enabled?: boolean;
}

export type ListHandlerResult<RowData extends IRowData = IAnything> = RowData[] | {
  rows: RowData[];
  total: number | null;
};

export type ListAvatar = {
  src?: string;
  alt?: string;
};

export type ListHandlerPagination = {
  limit: number;
  offset: number;
};

export type ListHandlerChips<RowData extends IRowData = IAnything> = Record<keyof RowData, boolean>;

export type ListHandlerSortModel<RowData extends IRowData = IAnything> = IListSortItem<RowData>[];

export type ListHandler<FilterData = IAnything, RowData extends IRowData = IAnything> = RowData[] | ((
  data: FilterData,
  pagination: ListHandlerPagination,
  sort: ListHandlerSortModel<RowData>,
  chips: ListHandlerChips<RowData>,
  search: string,
) => Promise<ListHandlerResult<RowData>> | ListHandlerResult<RowData>);

export interface IListState<FilterData = IAnything, RowData extends IRowData = IAnything> {
  initComplete: boolean;
  filterData: FilterData;
  isChooser: boolean;
  rows: RowData[];
  limit: number;
  offset: number;
  total: number | null;
  loading: boolean;
  search: string;
  filtersCollapsed: boolean;
  sort: ListHandlerSortModel<RowData>;
  chips: ListHandlerChips<RowData>;
};

export interface IListCallbacks<FilterData = IAnything, RowData extends IRowData = IAnything> {
  handleDefault: () => Promise<void>;
  handleSortModel: (sort: ListHandlerSortModel<RowData>) => void;
  handleFilter: (data: FilterData, keepPagination?: boolean) => void;
  handlePageChange: (page: number) => void;
  handleLimitChange: (limit: number) => void;
  handleFiltersCollapsed: (filtersCollapsed: boolean) => void;
  handleChips: (chips: ListHandlerChips) => void;
  handleReload: (keepPagination?: boolean) => Promise<void>;
  handleSearch: (search: string) => void;
  ready: () => void;
};

export interface IListSortItem<RowData extends IRowData = IAnything> {
  field: keyof RowData;
  sort: 'asc' | 'desc';
}

export interface IListProps<
  FilterData extends IAnything = IAnything,
  RowData extends IRowData = IAnything,
  Field extends IField = IField<FilterData>,
  > {
  apiRef?: Ref<IListApi>;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  filterLabel?: string;
  actions?: IListAction<RowData>[];
  operations?: IListOperation<RowData>[];
  limit?: number;
  page?: number;
  sizeByParent?: boolean;
  selectedRows?: RowId[];
  heightRequest?: (height: number) => number;
  widthRequest?: (width: number) => number;
  onSelectedRows?: (rowIds: RowId[], initialChange: boolean) => void;
  onFilterChange?: (data: FilterData) => void;
  onChipsChange?: (chips: IListChip<RowData>[]) => void;
  onSearchChange?: (search: string) => void;
  onSortModelChange?: (sort: ListHandlerSortModel<RowData>) => void;
  onOperation?: (action: string, selectedRows: RowData[], isAll: boolean, reload: (keepPagination?: boolean) => Promise<void>) => void;
  onRowAction?: (action: string, row: RowData, reload: (keepPagination?: boolean) => Promise<void>) => void;
  onRowClick?: (row: RowData,  reload: (keepPagination?: boolean) => Promise<void>) => void;
  onPageChange?: (page: number) => void;
  onColumnAction?: (field: string, action: string, selectedRows: RowData[], reload: (keepPagination?: boolean) => Promise<void>) => void;
  onLimitChange?: (limit: number) => void;
  onLoadStart?: (source: string) => void;
  onLoadEnd?: (isOk: boolean, source: string) => void;
  onAction?: (action: string, selectedRows: RowData[], reload: (keepPagination?: boolean) => Promise<void>) => void;
  columns: IColumn<RowData>[];
  filters?: Field[];
  handler: ListHandler;
  rowMark?: ((row: RowData) => string) | ((row: RowData) => Promise<string>) | string;
  fallback?: (e: Error) => void;
  rowActions?: IListRowAction[];
  toggleFilters?: boolean;
  withSearch?: boolean;
  withLoader?: boolean;
  withInitialLoader?: boolean;
  selectionMode?: SelectionMode;
  chips?: IListChip<RowData>[];
  search?: string;
  filterData?: Partial<FilterData>;
  sortModel?: ListHandlerSortModel<RowData>;
  isChooser?: boolean;
}

export default IListProps;
