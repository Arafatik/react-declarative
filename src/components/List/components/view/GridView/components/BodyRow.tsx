import * as React from 'react';
import { useMemo } from 'react';

import useProps from '../../../../hooks/useProps';
import useConstraintManager from '../../../../hooks/useConstraintManager';

import IAnything from "../../../../../../model/IAnything";
import IRowData from "../../../../../../model/IRowData";

import DisplayMode from "../../../../../../model/DisplayMode";

import { BodyRowSlot, BodyColumn } from '../../../../slots/BodyRowSlot';

export interface IBodyRowProps<RowData extends IRowData = IAnything> {
    fullWidth: number;
    mode: DisplayMode;
    row: RowData;
}

export const BodyRow = <RowData extends IRowData = IAnything>({
    fullWidth,
    mode,
    row,
}: IBodyRowProps<RowData>) => {

    const {
        columns: listColumns,
    } = useProps();

    const {
        wrapColumns,
    } = useConstraintManager();

    const columns = useMemo(() => {

        const columns = wrapColumns({
            columns: listColumns,
            fullWidth,
            mode,
        });

        return columns;

    }, [fullWidth]) as BodyColumn[];

    return (
        <BodyRowSlot
            row={row}
            mode={mode}
            columns={columns}
            fullWidth={fullWidth}
        />
    );

};

export default BodyRow;
