import * as React from 'react';
import { useEffect } from 'react';

import { makeStyles } from '../../../../styles';

import MatTablePagination from '@mui/material/TablePagination';
import PaginationItem from '@mui/material/PaginationItem';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { TablePaginationProps } from '@mui/material/TablePagination';
import { BoxProps } from '@mui/material/Box';

import ArrowBackIcon from '@mui/icons-material/KeyboardArrowLeft';
import ArrowForwardIcon from '@mui/icons-material/KeyboardArrowRight';

import useActualCallback from '../../../../hooks/useActualCallback';
import useSelection from '../../hooks/useSelection';
import useProps from '../../hooks/useProps';

import classNames from '../../../../utils/classNames';

const ACTION_GROW = 500;
const MIN_PAGES_COUNT = 10;

const useStyles = makeStyles({
    root: {
        display: 'flex',
        alignItems: 'center',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        '& .MuiTablePagination-selectLabel': {
            display: 'none',
        },
        '& .MuiToolbar-root': {
            paddingLeft: 'unset !important',
        },
        '& .MuiToolbar-root > .MuiInputBase-root': {
            marginRight: 'unset !important',
        },
        '& .MuiTablePagination-displayedRows': {
            transform: 'translateY(-1px)',
            marginLeft: '10px',
            marginRight: '10px',
        },
        '& .MuiTablePagination-actions': {
            marginLeft: 'unset !important',
        },
        '& .MuiToolbar-root > .MuiPagination-root': {
            marginLeft: 'unset !important',
        },
        '& .MuiToolbar-root > .MuiPagination-root > .MuiPagination-ul': {
            flexWrap: 'nowrap',
        },
        overflowX: 'auto',
    },
    label: {
        flex: 1,
        margin: 0,
        padding: 0,
        paddingLeft: 15,
        whiteSpace: 'nowrap',
    },
    disabled: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
});

const TablePaginationContainer = (props: BoxProps) => {
    const classes = useStyles();
    const { selection } = useSelection();
    const { loading } = useProps();
    return (
        <Box
            {...props}
            className={classNames(props.className, classes.root, {
                [classes.disabled]: loading,
            })}
        >   
            {selection.size ? (
                <Typography
                    variant="body1"
                    className={classes.label}
                >
                    {`Selected: ${selection.size} ${selection.size === 1 ? 'item' : 'items'}`}
                </Typography>
            ) : (
                <Box flex="1" />
            )}
            {props.children}
        </Box>
    );
};

const TableActions = ({
    className,
    count,
    page,
    rowsPerPage,
    onPageChange,
}: {
    className?: string;
    rowsPerPage: number;
    count: number;
    page: number;
    onPageChange: (e: any, page: number) => void;
}) => {
    const pages = Math.ceil(count / rowsPerPage);
    const paginationPage = page + 1;
    return (
        <Pagination
            className={className}
            page={paginationPage}
            count={count === -1 ? Math.max(paginationPage + 1, MIN_PAGES_COUNT): pages}
            renderItem={(item) => (
                <PaginationItem
                    components={{
                        previous: ArrowBackIcon,
                        next: ArrowForwardIcon
                    }}
                    {...item}
                />
            )}
            size="small"
            onChange={(e, page) => onPageChange(e, page - 1)}
        />
    );
};

type ITablePaginationProps = TablePaginationProps & {
    width: number;
    height: number;
};

export const TablePagination = ({
    width,
    height,
    ...props
}: ITablePaginationProps) => {

    const isGrow =  width > ACTION_GROW;

    const {
        withArrowPagination = false,
        loading,
    } = useProps();

    const Actions = isGrow
        ? TableActions
        : undefined;

    const {
        count,
        rowsPerPage,
        page,
        onPageChange
    } = props;

    const handleArrowKeydown = useActualCallback((e: any, go: number) => {
        if (count === -1) {
            onPageChange(e, Math.max(page + go, 0));
        } else {
            const totalPages = Math.ceil(count / rowsPerPage) - 1;
            onPageChange(e, Math.min(Math.max(page + go, 0), totalPages));
        }
    });

    useEffect(() => {
        const handler = (e: any) => {
            const { key } = e;
            if (key === 'ArrowRight') {
                handleArrowKeydown(e, 1);
            } else if (key === 'ArrowLeft') {
                handleArrowKeydown(e, -1);
            }
        };
        if (withArrowPagination && !loading) {
            document.addEventListener('keydown', handler);
        }
        return () => document.removeEventListener('keydown', handler);
    }, [withArrowPagination, loading]);

    return (
        <MatTablePagination
            {...props}
            component={TablePaginationContainer}
            ActionsComponent={Actions}
        />
    );
};

export default TablePagination;
