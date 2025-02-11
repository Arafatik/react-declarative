import * as React from 'react';
import { flushSync } from 'react-dom';

import { ThemeProvider } from '../../styles';

import { debounce } from '@mui/material';

import IListProps, { IListCallbacks, IListState, ListHandlerChips, ListHandlerResult, ListHandlerSortModel } from '../../model/IListProps';
import TypedField from '../../model/TypedField';
import IAnything from '../../model/IAnything';
import IRowData from '../../model/IRowData';
import IField from '../../model/IField';
import IListApi from '../../model/IListApi';

import initialValue from '../One/config/initialValue';

import NoSsr from '../NoSsr';

import deepMerge from '../../utils/deepMerge';
import deepFlat from '../../utils/deepFlat';
import sleep from '../../utils/sleep';
import set from '../../utils/set';
import create from '../../utils/create';

import GridView from './components/view/GridView';
import ChooserView from './components/view/ChooserView';

import { ConstraintManagerProvider } from './hooks/useConstraintManager';
import { ScrollManagerProvider } from './hooks/useScrollManager';
import { SelectionProvider } from './hooks/useSelection';
import { SortModelProvider } from './hooks/useSortModel';
import { ModalSortProvider } from './hooks/useModalSort';
import { CachedRowsProvider } from './hooks/useCachedRows';
import { PayloadProvider } from './hooks/usePayload';
import { ChipsProvider } from './hooks/useChips';
import { PropProvider } from './hooks/useProps';

import {
    DEFAULT_LIMIT,
    DEFAULT_PAGE,
    LIST_FETCH_DEBOUNCE,
} from './config';

import createScrollManager from './helpers/createScrollManager';
import createConstraintManager from './helpers/createConstraintManager';

import SlotFactory from './components/SlotFactory';

export class List<
    FilterData extends {} = IAnything,
    RowData extends IRowData = IAnything,
    Payload extends IAnything = IAnything,
    Field extends IField = IField<FilterData, Payload>,
> extends React.Component<IListProps<FilterData, RowData, Payload, Field>, IListState<FilterData, RowData>> {

    private isMountedFlag = false;
    private isFetchingFlag = false;
    private isRerenderFlag = false;
    private isPatchingFlag = false;

    private prevState: Partial<IListState> = {};

    private scrollManager = createScrollManager();
    private constraintManager = createConstraintManager();

    private unReloadSubject?: () => void;
    private unRerenderSubject?: () => void;
    private unSetLimitSubject?: () => void;
    private unSetPageSubject?: () => void;
    private unSetRowsSubject?: () => void;
    private unSetFilterDataSubject?: () => void;

    static defaultProps: Partial<IListProps> = {
        handler: () => [],
        payload: {},
        fallback: (e) => console.error(e),
        limit: DEFAULT_LIMIT,
        page: DEFAULT_PAGE,
        isChooser: false,
        filters: [],
        columns: [],
        actions: [],
        onSortModelChange: () => null,
        onFilterChange: () => null,
        onChipsChange: () => null,
        onSearchChange: () => null,
        onPageChange: () => null,
        onLimitChange: () => null,
        filterData: {},
        withToggledFilters: false,
        fetchDebounce: LIST_FETCH_DEBOUNCE,
        sortModel: [],
        chips: [],
        chipData: {},
        search: "",
        slots: {},
    };

    constructor(props: IListProps<FilterData, RowData, Payload, Field>) {
        super(props);
        this.state = {
            initComplete: false,
            isChooser: this.props.isChooser!,
            filterData: this.props.filterData as never,
            rows: [] as never,
            limit: this.props.limit!,
            offset: this.props.limit! * this.props.page!,
            total: null,
            search: this.props.search || '',
            loading: false,
            filtersCollapsed: this.props.withToggledFilters!,
            sort: this.props.sortModel!,
            chips: this.props.chips!.reduce<ListHandlerChips<RowData>>(
                (acm, { name: chip, enabled = false }) => ({ ...acm, [chip]: this.props.chipData![chip] || enabled }),
                {} as any,
            ),
            rerender: false,
        };
        this.prevState = { ...this.state };
        this.handleFetchQueue = this.createHandleFetchQueue(props.fetchDebounce);
    };

    private setLoading = (loading: boolean) => this.isMountedFlag && this.setState((prevState) => ({ ...prevState, loading }));
    private setFiltersCollapsed = (filtersCollapsed: boolean) => this.isMountedFlag && this.setState((prevState) => ({ ...prevState, filtersCollapsed }));

    public componentDidUpdate = () => {
        this.handleUpdateRef();
        if (this.state.rerender) {
            this.beginRerender();
        } else {
            this.beginFetchQueue();
        }
    };

    public componentDidMount = () => {
        this.isMountedFlag = true;
        this.handleEmptyFilters();
        this.handleUpdateRef();
    };

    public componentWillUnmount = () => {
        this.isFetchingFlag = false;
        this.isMountedFlag = false;
        this.handleFetchQueue.clear();
        this.unReloadSubject && this.unReloadSubject();
        this.unRerenderSubject && this.unRerenderSubject();
        this.unSetLimitSubject && this.unSetLimitSubject();
        this.unSetPageSubject && this.unSetPageSubject();
        this.unSetRowsSubject && this.unSetRowsSubject();
    };

    private beginRerender = () => {
        queueMicrotask(() => flushSync(() => {
            this.isMountedFlag && this.setState((prevState) => ({
                ...prevState,
                rerender: false,
            }));
            this.isRerenderFlag = true;
        }));
    };

    private beginFetchQueue = () => {
        if (this.prevState.filtersCollapsed === this.state.filtersCollapsed) {
            this.handleFetchQueue();
        } else {
            this.prevState.filtersCollapsed = this.state.filtersCollapsed;
        }
    };

    private createHandleFetchQueue = (delay = LIST_FETCH_DEBOUNCE) => debounce(() => {
        const updateQueue = [
            this.handlePageChanged,
            this.handleParamsChanged
        ];
        let isOk = true;
        isOk = isOk && !this.state.loading;
        isOk = isOk && this.state.initComplete;
        if (isOk) {
            if (!this.isFetchingFlag) {
                return;
            } else if (this.isRerenderFlag) {
                this.isRerenderFlag = false;
            } else if (this.isPatchingFlag) {
                this.isPatchingFlag = false;
            } else {
                this.isFetchingFlag = false;
                updateQueue.reduce((acm, cur) => {
                    if (acm) {
                        return !cur();
                    }
                    return acm;
                }, true);
            }
        }
        this.prevState = {...this.state};
    }, delay);

    private handleFetchQueue = this.createHandleFetchQueue();

    private handlePageChanged = () => {
        let isOk = false;
        isOk = isOk || this.prevState.offset === this.state.offset;
        isOk = isOk || this.prevState.limit === this.state.limit;
        if (isOk) {
            this.handleReload();
        }
        return isOk;
    };

    private handleParamsChanged = () => {
        let isOk = false;
        isOk = isOk || this.prevState.chips === this.state.chips;
        isOk = isOk || this.prevState.sort === this.state.sort;
        isOk = isOk || this.prevState.search === this.state.search;
        if (isOk) {
            this.handleFilter(this.state.filterData, false);
            this.props.onPageChange!(0);
        }
        return isOk;
    };

    private handleUpdateRef = () => {
        const { apiRef } = this.props;
        const instance: IListApi<FilterData, RowData> = {
            reload: this.handleReload,
            setLimit: this.handleLimitChange,
            setPage: this.handlePageChange,
            setRows: this.handleRowsChange,
            setFilterData: this.handleFilter,
            getState: () => ({ ...this.state }),
            rerender: this.handleRerender,
        };
        if (typeof apiRef === 'function') {
            apiRef(instance);
        } else if (apiRef) {
            (apiRef.current as any) = instance;
        }
        if (this.props.reloadSubject) {
            this.unReloadSubject && this.unReloadSubject();
            this.unReloadSubject = this.props.reloadSubject
                .subscribe(this.handleReload as () => void);
        }
        if (this.props.rerenderSubject) {
            this.unRerenderSubject && this.unRerenderSubject();
            this.unRerenderSubject = this.props.rerenderSubject
                .subscribe(this.handleRerender);
        }
        if (this.props.setLimitSubject) {
            this.unSetLimitSubject && this.unSetLimitSubject();
            this.unSetLimitSubject = this.props.setLimitSubject
                .subscribe(this.handleLimitChange);
        }
        if (this.props.setPageSubject) {
            this.unSetPageSubject && this.unSetPageSubject();
            this.unSetPageSubject = this.props.setPageSubject
                .subscribe(this.handlePageChange);
        }
        if (this.props.setRowsSubject) {
            this.unSetRowsSubject && this.unSetRowsSubject();
            this.unSetRowsSubject = this.props.setRowsSubject
                .subscribe(this.handleRowsChange);
        }
        if (this.props.setFilterDataSubject) {
            this.unSetFilterDataSubject && this.unSetFilterDataSubject();
            this.unSetFilterDataSubject = this.props.setFilterDataSubject
                .subscribe(this.handleFilter);
        }
    };

    private handleEmptyFilters = () => {
        const hasFilters = Array.isArray(this.props.filters) && !!this.props.filters.length;
        if (!hasFilters) {
          this.handleDefault(true);
        }
        this.prevState.filtersCollapsed = this.state.filtersCollapsed;
    };

    private handleRows = async (filterData: FilterData, keepPagination = false): Promise<{
        rows: RowData[];
        total: number | null;
    }> => {
        /** react-18 prevent batching */
        await sleep(0);
        if (typeof this.props.handler === 'function') {
            const response: ListHandlerResult<RowData> = await Promise.resolve(this.props.handler(filterData, {
                limit: this.state.limit,
                offset: keepPagination ? this.state.offset : 0,
            }, this.state.sort, this.state.chips, this.state.search));
            if (Array.isArray(response)) {
                response.length > this.state.limit && console.warn("List rows count is more than it's capacity");
                return {
                    rows: response.slice(0, this.state.limit),
                    total: null,
                };
            } else {
                const { rows = [], total = null } = response || {};
                rows.length > this.state.limit && console.warn("List rows count is more than it's capacity");
                return { rows: rows.slice(0, this.state.limit), total };
            }
        } else {
            if (Array.isArray(this.props.handler)) {
                return {
                    rows: this.props.handler.slice(this.state.offset, this.state.limit + this.state.offset),
                    total: this.props.handler.length,
                };
            } else {
                const { rows = [], total = null } = this.props.handler || {};
                return {
                    rows: rows.slice(this.state.offset, this.state.limit + this.state.offset),
                    total,
                };
            }
        }
    };

    private handleFilter = async (filterData: FilterData, keepPagination = false) => {
        if (this.state.loading) {
            return;
        }
        this.setLoading(true);
        try {
            const {
                rows,
                total,
            } = await this.handleRows(filterData, keepPagination);
            if (!keepPagination) {
                this.scrollManager.scrollTop();
            }
            this.isMountedFlag && this.setState((prevState) => ({
                ...prevState,
                initComplete: true,
                loading: false,
                filterData,
                rows,
                total,
                ...(!keepPagination && {
                    offset: 0,
                }),
            }));
        } catch (e) {
            this.props.fallback!(e as Error);
        } finally {
            this.setLoading(false);
            this.props.onFilterChange!(filterData);
        }
    };

    private handleDefault = async (initialCall = false) => {
        const newData: Partial<FilterData> = {};
        deepFlat(this.props.filters)
            .filter(({ name }) => !!name)
            .map(({ type, name }) => {
                create(newData, name);
                set(newData, name, initialValue(type));
            });
        if (initialCall) {
            deepMerge(newData, this.props.filterData!);
        }
        await this.handleFilter(newData as FilterData, initialCall);
        !initialCall && this.props.onPageChange!(0);
    };

    private handleReload = async (keepPagination = true) => {
        await this.handleFilter(this.state.filterData, keepPagination);
        !keepPagination && this.props.onPageChange!(0);
    };

    private handlePageChange = (page: number) => {
        this.isFetchingFlag = true;
        this.isMountedFlag && this.setState((prevState) => ({
            ...prevState,
            offset: page * this.state.limit,
        }));
        this.props.onPageChange!(page);
    };

    private handleLimitChange = (newLimit: number) => {
        this.isFetchingFlag = true;
        const newPage = Math.floor(this.state.offset / newLimit);
        this.isMountedFlag && this.setState((prevState) => ({
            ...prevState,
            offset: newPage * newLimit,
            limit: newLimit,
        }));
        this.props.onLimitChange!(newLimit);
    };

    private handleRowsChange = (rows: RowData[]) => {
        this.isPatchingFlag = true;
        this.isMountedFlag && this.setState((prevState) => ({
            ...prevState,
            rows: rows.slice(0, this.state.limit)
                .map((row) => ({ ...row })),
        }));
    };

    private handleSortModel = (sort: ListHandlerSortModel) => {
        this.isFetchingFlag = true;
        this.isMountedFlag && this.setState((prevState) => ({
          ...prevState,
          offset: 0,
          sort,
        }));
        this.props.onSortModelChange!(sort);
        this.props.onPageChange!(0);
    };

    private handleChips = (chips: ListHandlerChips) => {
        this.isFetchingFlag = true;
        this.isMountedFlag && this.setState((prevState) => ({
          ...prevState,
          offset: 0,
          chips,
        }));
        this.props.onChipsChange!({...this.state.chips, ...chips});
        this.props.onPageChange!(0);
    };

    private handleSearch = (search: string) => {
        this.isFetchingFlag = true;
        this.isMountedFlag && this.setState((prevState) => ({
          ...prevState,
          offset: 0,
          search,
        }));
        this.props.onSearchChange!(search);
        this.props.onPageChange!(0);
    };

    private handleRerender = () => {
        queueMicrotask(() => flushSync(() => {
            this.isMountedFlag && this.setState((prevState) => ({
                ...prevState,
                rerender: true,
            }));
        }));
    };

    private handleFiltersCollapsed = (filtersCollapsed: boolean) => this.setFiltersCollapsed(filtersCollapsed);

    private getCallbacks = (): IListCallbacks => ({
        handlePageChange: this.handlePageChange,
        handleLimitChange: this.handleLimitChange,
        handleSortModel: this.handleSortModel,
        handleDefault: this.handleDefault,
        handleFilter: this.handleFilter,
        handleReload: this.handleReload,
        handleChips: this.handleChips,
        handleSearch: this.handleSearch,
        handleRowsChange: this.handleRowsChange,
        handleFiltersCollapsed: this.handleFiltersCollapsed,
        handleRerender: this.handleRerender,
        ready: () => this.handleDefault(true),
    });

    public renderInner = () => {
        const callbacks = this.getCallbacks();
        if (this.props.isChooser) {
            return (
                <ChooserView<FilterData, RowData>
                    {...this.props}
                    {...this.state}
                    handler={this.props.handler}
                    filters={this.props.filters}
                    columns={this.props.columns}
                    actions={this.props.actions}
                    limit={this.state.limit}
                    offset={this.state.offset}
                    listChips={this.props.chips}
                    {...callbacks}
                />
            );
        } else {
            return (
                <GridView<FilterData, RowData>
                    {...this.props}
                    {...this.state}
                    handler={this.props.handler}
                    filters={this.props.filters}
                    columns={this.props.columns}
                    actions={this.props.actions}
                    limit={this.state.limit}
                    offset={this.state.offset}
                    listChips={this.props.chips}
                    {...callbacks}
                />
            );
        }
    };

    public render = () => {
        const callbacks = this.getCallbacks();
        return (
            <NoSsr>
                <ThemeProvider>
                    <PropProvider {...{ ...this.props, ...this.state, ...callbacks }}>
                        <ScrollManagerProvider payload={this.scrollManager}>
                            <ConstraintManagerProvider payload={this.constraintManager}>
                                <SelectionProvider selectedRows={this.props.selectedRows}>
                                    <CachedRowsProvider>
                                        <SortModelProvider sortModel={this.props.sortModel!}>
                                            <ChipsProvider chips={this.props.chips!} chipData={this.props.chipData!}>
                                                <ModalSortProvider>
                                                    <SlotFactory {...this.props.slots}>
                                                        <PayloadProvider value={this.props.payload!}>
                                                            {this.renderInner()}
                                                        </PayloadProvider>
                                                    </SlotFactory>
                                                </ModalSortProvider>
                                            </ChipsProvider>
                                        </SortModelProvider>
                                    </CachedRowsProvider>
                                </SelectionProvider>
                            </ConstraintManagerProvider>
                        </ScrollManagerProvider>
                    </PropProvider>
                </ThemeProvider>
            </NoSsr>
        );
    };

};

export const ListTyped = <
    FilterData extends {} = IAnything,
    RowData extends IRowData = IAnything,
>(
    props: IListProps<FilterData, RowData, TypedField<FilterData>>,
) => <List<FilterData, RowData> {...props} />;

export default List;
