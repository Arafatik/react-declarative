import * as React from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { makeStyles } from "../../styles";

import Box, { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import AccessTimeIcon from '@mui/icons-material/AccessTime';

import useActualCallback from "../../hooks/useActualCallback";
import classNames from "../../utils/classNames";

export interface ICountdownProps extends BoxProps {
  expireAt: string | number | Date;
  onExpire?: () => void;
}

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
  },
}));

export const Countdown = ({
  className,
  expireAt,
  onExpire = () => undefined,
  ...otherProps
}: ICountdownProps) => {
  const { classes } = useStyles();

  const [count, setCount] = useState<number>();
  const intervalRef = useRef<number>();

  const onExpire$ = useActualCallback(onExpire);

  const timeout = useMemo(() => {
    const date = new Date(expireAt);
    return new Date(+date - Date.now());
  }, [count]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(Date.now());
    });
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (+timeout < 0) {
      onExpire$();
      clearInterval(intervalRef.current);
    }
  }, [timeout]);

  if (+timeout < 0) {
    return <>00:00</>;
  }

  const renderInner = useCallback(() => {
    if (+timeout < 0) {
      return <Typography variant="body1">00:00</Typography>;
    }
    return (
      <Typography variant="body1">
        {timeout.getMinutes().toString().padStart(2, "0")}:
        {timeout.getSeconds().toString().padStart(2, "0")}
      </Typography>
    );
  }, [timeout]);

  return (
    <Box 
      className={classNames(classes.root, className)}
      {...otherProps}
    >
      <Box className={classes.container}>
        <AccessTimeIcon />
        {renderInner()}
      </Box>
    </Box>
  );
};

export default Countdown;
