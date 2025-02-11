import * as React from 'react';
import { useMemo, useCallback } from 'react';

import { makeStyles } from '../../../../../../../styles';

import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import ActionMenu from '../../../../../../ActionMenu';

import IRowData from '../../../../../../../model/IRowData';
import IAnything from '../../../../../../../model/IAnything';

import ColumnType from '../../../../../../../model/ColumnType';
import SelectionMode from '../../../../../../../model/SelectionMode';

import { IHeadRowSlot, HeadColumn } from '../../../../../slots/HeadRowSlot';

import fieldToHeader from '../../../../../helpers/fieldToHeader';

import useCachedRows from '../../../../../hooks/useCachedRows';
import useSortModel from '../../../../../hooks/useSortModel';
import useSelection from '../../../../../hooks/useSelection';
import useReload from '../../../../../hooks/useReload';
import useProps from '../../../../../hooks/useProps';
import usePayload from '../../../../../hooks/usePayload';

const useStyles = makeStyles()((theme) => ({
    cell: {
        paddingLeft: '4px !important',
        paddingRight: '0 !important',
        background: `${theme.palette.background.paper} !important`,
    },
    bold: {
        fontWeight: 'bold !important',
        opacity: 0.7,
    },
    menu: {
        margin: '0 !important',
        padding: '0 !important',
        width: 'unset !important',
        height: 'unset !important',
        '& .MuiSvgIcon-root': {
            height: '20px !important',
            width: '20px !important',
        }
    },
}));

const LOAD_SOURCE = 'list-columns';

export const DesktopHeadRow = <RowData extends IRowData = IAnything>({
    fullWidth,
    columns,
}: IHeadRowSlot) => {

    const { classes } = useStyles();

    const props = useProps<RowData>();
    const { sortModel, setSortModel } = useSortModel();
    const { selection, setSelection } = useSelection();
    const { selectedRows } = useCachedRows();
    const payload = usePayload();

    const reload = useReload();

    const {
        selectionMode,
        loading,
        onColumnAction,
        onLoadStart,
        onLoadEnd,
        fallback,
    } = props;

    const isAllSelected = useMemo(() => {
        for (const row of props.rows) {
            if (!selection.has(row.id)) {
                return false;
            }
        }
        return !!props.rows.length;
    }, [selection, props.rows]);

    const isIndeterminate = !!selection.size && !isAllSelected;

    const renderCheckbox = () => {

        const handleCheckboxClick = () => {
            if (selectionMode === SelectionMode.None) {
                return;
            }
            if (selectionMode === SelectionMode.Single) {
                setSelection(new Set());
                return;
            }
            if (isAllSelected) {
                setSelection(new Set());
                return;
            }
            props.rows.forEach(({ id }) => selection.add(id));
            setSelection(selection);
        };

        const handleRadioClick = () => {
            setSelection(new Set());
        };

        if (selectionMode === SelectionMode.Single) {
            return (
                <Radio
                    key={selection.size}
                    disabled={loading}
                    color="primary"
                    onChange={handleRadioClick}
                />
            );
        } else if (selectionMode === SelectionMode.Multiple) {
            return (
                <Checkbox
                    disabled={loading}
                    color="primary"
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onClick={handleCheckboxClick}
                />
            );
        } else {
            return (
                <Checkbox
                    color="primary"
                    disabled
                />
            );
        }
    };

    const handleSortToggle = useCallback((id: string) => {
        const sortModelCopy = new Map(sortModel);
        const sortTarget = sortModel.get(id);
        if (sortTarget) {
            if (sortTarget.sort === 'asc') {
                sortModelCopy.set(id, {
                    field: id,
                    sort: 'desc',
                })
            } else if (sortTarget.sort === 'desc') {
                sortModelCopy.delete(id);
            }
        } else {
            sortModelCopy.set(id, {
                field: id,
                sort: 'asc',
            });
        }
        setSortModel(sortModelCopy);
    }, [sortModel]);

    const handleLoadStart = () => onLoadStart && onLoadStart(LOAD_SOURCE);
    const handleLoadEnd = (isOk: boolean) => onLoadEnd && onLoadEnd(isOk, LOAD_SOURCE);
    const createHandleAction = (field: string) => (action: string) => onColumnAction && onColumnAction(field, action, selectedRows, reload);

    const content = useMemo(() => {

        const renderColumn = (column: HeadColumn, idx: number) => {
            const sortTarget = sortModel.get(column.field || '');
            const sortDirection = sortTarget?.sort || undefined;
    
            let isSortable = !!column.field;
            isSortable = isSortable && column.sortable !== false;
            isSortable = isSortable && column.type !== ColumnType.Action;
    
            const handleClick = () => {
                if (isSortable) {
                    handleSortToggle(column.field!);
                }
            };
    
            const minWidth = column.width;
            const maxWidth = minWidth;
    
            const align = column.type === ColumnType.Action ? 'center' : 'left';

            const { headerName = fieldToHeader(column.field || '') || 'Unknown' } = column;
    
            return (
                <TableCell
                    className={classes.cell}
                    key={idx}
                    align={align}
                    style={{ minWidth, maxWidth }}
                    sortDirection={sortDirection}
                >
                    <Box
                        sx={{
                            width: 'calc(100% - 40px)',
                            display: 'inline-block',
                        }}
                    >
                        {isSortable ? (
                            <TableSortLabel
                                className={classes.bold}
                                active={!!sortTarget}
                                direction={sortDirection}
                                onClick={handleClick}
                                disabled={loading}
                            >
                                {headerName}
                            </TableSortLabel>
                        ) : (
                            <span className={classes.bold}>
                                {headerName}
                            </span>
                        )}
                    </Box>
                    {!!column.columnMenu && (
                        <ActionMenu
                            transparent
                            className={classes.menu}
                            options={column.columnMenu.map(({
                                isDisabled = () => false,
                                isVisible = () => true,
                                ...other
                            }) => ({
                                ...other,
                                isDisabled: () => isDisabled(selectedRows, payload),
                                isVisible: () => isVisible(selectedRows, payload),
                            }))}
                            onAction={createHandleAction(column.field || 'unset-field')}
                            fallback={fallback}
                            payload={selectedRows}
                            onLoadStart={handleLoadStart}
                            onLoadEnd={handleLoadEnd}
                            disabled={loading}
                            deps={[payload]}
                            throwError
                        />
                    )}
                </TableCell>
            );
        };
    
        const content = columns.map(renderColumn);

        return content;

    }, [fullWidth]);

    const computeTooltipLabel = () => {
        if (selectionMode === SelectionMode.Single) {
            return "Deselect";
        }
        if (isIndeterminate) {
            return 'Select all';
        }
        return isAllSelected ? 'Deselect' : 'Select all';
    };

    return (
        <TableRow>
            <TableCell className={classes.cell} padding="checkbox">
                {selectionMode === SelectionMode.None ? (
                    <>
                        {renderCheckbox()}
                    </>
                ) : (
                    <Tooltip title={computeTooltipLabel()}>
                        {renderCheckbox()}
                    </Tooltip>
                )}
            </TableCell>
            {content}
        </TableRow>
    );
};

export default DesktopHeadRow;
