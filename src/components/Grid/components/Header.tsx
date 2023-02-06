import * as React from "react";
import { useCallback } from "react";
import { alpha, SxProps } from "@mui/system";

import { makeStyles } from "../../../styles";

import Box from "@mui/material/Box";

import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import IColumn from "../model/IColumn";
import RowData from "../model/RowData";
import IGridProps from "../model/IGridProps";

import Cell from "./Cell";
import Center from "./Center";

import Subject from "../../../utils/rx/Subject";
import randomString from "../../../utils/randomString";
import classNames from "../../../utils/classNames";

import { ACTIONS_WIDTH } from "../config";

const ROW_ACTIONS_UNIQUE_KEY = randomString();

interface IHeaderProps<T = RowData> {
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps;
  columns: Array<IColumn>;
  sort: IGridProps<T>["sort"];
  rowActions: IGridProps<T>["rowActions"];
  scrollXSubject: Subject<number>;
  onScrollX: (scrollX: number) => void;
  onClickHeaderColumn: IGridProps<T>["onClickHeaderColumn"];
}

const useStyles = makeStyles()((theme) => ({
  headerRow: {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    overflowX: "auto",
    overflowY: "hidden",
    maxWidth: "100%",
    height: "35px",
    borderBottom: `1px solid ${alpha(
      theme.palette.getContrastText(theme.palette.background.default),
      0.23
    )}`,
    scrollbarWidth: "none",
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  headerCell: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: "5px",
    paddingRight: "5px",
    paddingTop: "7.5px",
    paddingBottom: "7.5px",
    width: "100%",
    whiteSpace: "break-spaces",
    overflowWrap: "anywhere",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  headerCellClick: {
    "&:hover": {
      backgroundColor: "#f9f9f9",
      cursor: "pointer",
    },
  },
  coloredHeaderCell: {
    background: alpha(theme.palette.background.paper, 0.2),
  },
  headerCellSortable: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
}));

export const Header = <T extends RowData>({
  className,
  style,
  sx,
  columns,
  sort,
  rowActions,
  scrollXSubject,
  onClickHeaderColumn,
  onScrollX,
}: IHeaderProps<T>) => {
  const { classes } = useStyles();
  const handleRef = useCallback(
    (ref: HTMLDivElement | null) => {
      if (!ref) {
        return;
      }
      scrollXSubject.subscribe((scrollX) => {
        if (ref.scrollLeft !== scrollX) {
          ref.scrollTo(Math.min(scrollX, ref.scrollWidth), ref.scrollTop);
        }
      });
    },
    [scrollXSubject]
  );

  return (
    <Box
      ref={handleRef}
      className={classNames(className, classes.headerRow)}
      style={style}
      sx={sx}
      onScroll={(e) => {
        const target = e.target as HTMLDivElement;
        if (onScrollX) {
          onScrollX(target.scrollLeft);
        }
      }}
    >
      {columns.map((column, idx) => {
        const rowId = `${String(column.field)}-${idx}`;
        return (
          <Cell
            key={rowId}
            className={classNames(classes.headerCell, {
              [classes.headerCellClick]: Boolean(onClickHeaderColumn),
              [classes.coloredHeaderCell]: sort && sort.value === column.field,
            })}
            column={column}
            idx={idx}
            onClick={() => {
              if (onClickHeaderColumn) {
                onClickHeaderColumn(column.field as unknown as keyof T);
              }
            }}
          >
            <div
              className={classNames({
                [classes.headerCellSortable]: Boolean(sort),
              })}
            >
              {column.label} {/* eslint-disable-next-line no-nested-ternary */}
              {sort && sort.value === column.field ? (
                sort?.sortDirection === "ASC" ? (
                  <ArrowDropUpIcon />
                ) : (
                  <ArrowDropDownIcon />
                )
              ) : null}
            </div>
          </Cell>
        );
      })}
      {!!rowActions?.length && (
        <Center
          className={classes.headerCell}
          key={ROW_ACTIONS_UNIQUE_KEY}
          sx={{
            minWidth: ACTIONS_WIDTH,
            maxWidth: ACTIONS_WIDTH,
          }}
        >
          Actions
        </Center>
      )}
    </Box>
  );
};

export default Header;
