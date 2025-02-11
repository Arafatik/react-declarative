import * as React from 'react';

import { makeStyles } from '../../../../../styles';
import { alpha } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { ILineSlot } from '../../../slots/LineSlot';

const useStyles = makeStyles()((theme) => ({
    root: {
        height: 72,
        display: 'flex',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
        alignItems: 'center',
        justifyContent: 'stretch',
    },
    line: {
        background: alpha(theme.palette.getContrastText(theme.palette.background.default), 0.23),
        flexGrow: 1,
        margin: 15,
        height: 1,
    }
}));

export const Line = ({
    title = "",
    lineTransparent = false,
}: ILineSlot) => {
    const { classes } = useStyles();
    return (
        <Box className={classes.root}>
            <Typography variant="h5">{title}</Typography>
            {!lineTransparent && (
                <Box className={classes.line} />
            )}
        </Box>
    );
};

export default Line;
