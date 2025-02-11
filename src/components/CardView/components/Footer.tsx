import * as React from "react";

import { makeStyles } from "../../../styles";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import useSelectionContext from "../context/SelectionContext";
import useStateContext from "../context/StateContext";

import wordForm from "../../../utils/wordForm";

const useStyles = makeStyles()({
  root: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 35,
    maxHeight: 35,
  },
});

export const Footer = () => {
  const { classes } = useStyles();
  const { state } = useStateContext();
  const { dropSelection } = useSelectionContext();
  return (
    <Box className={classes.root}>
      {!!state.selectedIds.size && (
        <>
            <Typography variant="body1">
                {`Selected: ${wordForm(state.selectedIds.size, {
                    one: "item",
                    many: "items",
                })}`}
            </Typography>
            <Link href="#" onClick={dropSelection}>
                Deselect
            </Link>
        </>
      )}
    </Box>
  );
};

export default Footer;
