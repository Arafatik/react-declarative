import * as React from "react";

import { makeStyles } from "../../../styles";

import Group, { IGroupProps } from "../../../components/common/Group";
import Paper, { IPaperProps } from '../../../components/common/Paper';

import classNames from "../../../utils/classNames";

import { PickProp } from "../../../model/IManaged";
import IAnything from "../../../model/IAnything";
import IField from "../../../model/IField";

import makeLayout from "../components/makeLayout/makeLayout";

export interface IPaperLayoutProps<Data = IAnything, Payload = IAnything> extends IPaperProps<Data, Payload>, IGroupProps<Data, Payload> {
  innerPadding?: PickProp<IField<Data, Payload>, 'innerPadding'>;
}

interface IPaperLayoutPrivate {
  children: React.ReactNode;
}

const useStyles = makeStyles()({
  root: {
    position: "relative",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
  },
  content: {
    flexGrow: 1,
    width: "100%",
  },
});

export const PaperLayout = <Data extends IAnything = IAnything>({
  columns,
  columnsOverride,
  sx,
  phoneColumns,
  tabletColumns,
  desktopColumns,
  style,
  className,
  children,
  fieldRightMargin = '0',
  fieldBottomMargin = '0',
  innerPadding: padding = '18px',
}: IPaperLayoutProps<Data> & IPaperLayoutPrivate) => {
  const { classes } = useStyles();
  return (
    <Group
      className={classNames(className, classes.root)}
      style={style}
      isItem={true}
      columns={columns}
      phoneColumns={phoneColumns}
      tabletColumns={tabletColumns}
      desktopColumns={desktopColumns}
      fieldRightMargin={fieldRightMargin}
      fieldBottomMargin={fieldBottomMargin}
    >
      <Paper
        className={classes.content}
        columnsOverride={columnsOverride}
        sx={sx}
        style={{ padding }}
      >
        {children}
      </Paper>
    </Group>
  );
};

PaperLayout.displayName = 'PaperLayout';

export default makeLayout(PaperLayout) as typeof PaperLayout;
