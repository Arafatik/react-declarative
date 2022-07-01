import { useState } from 'react';

import { 
    ListHandler,
    ListHandlerChips,
    ListHandlerSortModel,
    ListHandlerPagination,
} from "../../../model/IListProps";

import IAnything from "../../../model/IAnything";
import IRowData from "../../../model/IRowData";

interface IResult<FilterData = IAnything, RowData extends IRowData = IAnything> {
    data: IState<FilterData, RowData>;
    handler: ListHandler<FilterData, RowData>;
}

interface IState<FilterData = IAnything, RowData extends IRowData = IAnything> {
    filterData: FilterData;
    pagination: ListHandlerPagination;
    sort: ListHandlerSortModel<RowData>;
    chips: ListHandlerChips<RowData>;
    search: string;
}

export const useLastPagination = <FilterData = IAnything, RowData extends IRowData = IAnything>(upperHandler: ListHandler<FilterData, RowData>): IResult => {
    const [data, setData] = useState<IState<FilterData, RowData>>({
        filterData: {} as FilterData,
        chips: {} as ListHandlerChips<RowData>,
        sort: [],
        pagination: {
            offset: 0,
            limit: 0,
        },
        search: "",
    });
    const handler: ListHandler<FilterData, RowData> = (filterData, pagination, sort, chips, search) => {
        setData({ filterData, pagination, sort, chips, search });
        return typeof upperHandler === 'function' ? upperHandler(filterData, pagination, sort, chips, search): upperHandler;
    };
    return {
        handler,
        data,
    };
};

export default useLastPagination;
