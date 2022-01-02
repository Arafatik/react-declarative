import * as React from "react";
import { useRef, useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';

import { FixedSizeList, ListOnScrollProps } from "react-window";

import Box from '@material-ui/core/Box';
import MatListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import NotInterested from '@material-ui/icons/NotInterested';

import IListProps, { IListState, IListCallbacks } from '../../../../model/IListProps';
import IAnything from '../../../../model/IAnything';
import IRowData from '../../../../model/IRowData';

import ListItem from "./ListItem";

import Container from "../Container";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
  },
  empty: {
    position: 'absolute',
    zIndex: 999,
    top: 0,
    left: 0,
    right: 0,
  },
}));

interface IMobileProps<FilterData = IAnything, RowData extends IRowData = IAnything> extends
  Omit<IListProps<FilterData, RowData>, keyof {
    ref: never;
    limit: never;
    autoReload: never;
  }>,
  IListState<FilterData, RowData>,
  IListCallbacks<FilterData, RowData> {
  className?: string;
  style?: React.CSSProperties;
}

interface IMobileState<FilterData = IAnything, RowData extends IRowData = IAnything> {
  rows: IMobileProps<FilterData, RowData>["rows"];
  filterData: IMobileProps<FilterData, RowData>["filterData"];
};

export const Mobile = <
  FilterData extends IAnything = IAnything,
  RowData extends IRowData = IAnything,
>(props: IMobileProps<FilterData, RowData>) => {

  const innerRef = useRef<HTMLElement>(null);
  const outerRef = useRef<HTMLElement>(null);

  const classes = useStyles();

  const {
    rows: upperRows,
    filterData: upperFilterData,
    rowHeight,
    offset,
    limit,
    total,
    loading,
  } = props;

  const {
    handlePageChange,
  } = props;

  const [state, setState] = useState<IMobileState>({
    rows: upperRows,
    filterData: upperFilterData,
  });

  const handleCleanRows = useCallback(() => {
    const { current } = outerRef;
    setState(() => ({
      rows: upperRows,
      filterData: upperFilterData,
    }));
    current && current.scrollTo(0, 0);
  }, [upperRows, upperFilterData]);

  const handleAppendRows = useCallback(() => setState(({
    rows,
    filterData,
  }) => {
    const rowIds = new Set(rows.map(({ id }) => id));
    return {
      filterData,
      rows: [...rows, ...upperRows.filter(({ id }) => !rowIds.has(id))],
    };
  }), [state, upperRows]);

  useEffect(() => handleAppendRows(), [upperRows]);
  useEffect(() => handleCleanRows(), [upperFilterData]);

  const createScrollHandler = (height: number) => ({
    scrollDirection,
    scrollOffset,
  }: ListOnScrollProps) => {
    if (scrollDirection === 'forward') {
      const { current } = innerRef;
      if (current && !loading) {
        const { height: scrollHeight } = current.getBoundingClientRect();
        const pendingPage = Math.floor(offset / limit) + 1;
        if (height + scrollOffset === scrollHeight) {
          if (!total || pendingPage * limit < total) {
            handlePageChange(pendingPage);
          }
        }
      }
    }
  };

  return (
    <Container<FilterData, RowData>
      {...props}
      {...state}
    >
      {({ height, width, payload: { rows } }) => (
        <Box position="relative" style={{height, width}}>
          {!rows.length && (
            <MatListItem className={classes.empty}>
              <ListItemIcon>
                <NotInterested />
              </ListItemIcon>
              <ListItemText
                primary="Empty"
                secondary="Nothing found"
              />
            </MatListItem>
          )}
          <FixedSizeList
            className={classes.root}
            height={height}
            width={width}
            itemCount={rows.length}
            onScroll={createScrollHandler(height)}
            innerRef={innerRef}
            outerRef={outerRef}
            itemSize={rowHeight}
          >
            {({ index, style }) => (
              <ListItem
                key={index}
                row={rows[index]}
                rows={rows}
                style={style}
              />
            )} 
          </FixedSizeList>
        </Box>
      )}
    </Container>
  )
};

export default Mobile;
