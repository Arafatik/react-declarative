import * as React from 'react';
import { useState } from 'react';

import { makeStyles } from '../../styles';
import { darken } from '@mui/system';

import Box, { BoxProps } from '@mui/material/Box';

import ActionFab from '../ActionFab';

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import DeleteIcon from '@mui/icons-material/Delete';

import { ActionMenu, IActionMenuProps } from '../ActionMenu';

import classNames from '../../utils/classNames';
import openBlank from '../../utils/openBlank';

const FAB_SIZE = 48;

interface IImageViewProps<T extends any = object> extends BoxProps, Omit<IActionMenuProps<T>, keyof {
    className: never;
    style: never;
    sx: never;
    transparent: never;
    onToggle: never;
}> {
    withFullScreen?: boolean;
    withDelete?: boolean;
    src: string;
    onFullScreenClick?: () => (Promise<void> | void);
    onDeleteClick?: () => (Promise<void> | void);
    onLoadStart?: () => void;
    onLoadEnd?: (isOk: boolean) => void;
    fallback?: (e: Error) => void;
    throwError?: boolean;
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'light'
            ? theme.palette.background.paper
            : darken(theme.palette.background.paper, 0.06),
    },
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
    },
    content: {
        objectFit: 'contain',
        margin: '6px',
        flex: 1,
    },
    fabFullscreen: {
        position: 'absolute',
        transition: 'opacity 150ms',
        opacity: 0,
        bottom: 10,
        right: 10,
        zIndex: 2,
    },
    fabFullscreenToggle: {
        opacity: 1,
    },
    fabDelete: {
        position: 'absolute',
        transition: 'opacity 150ms',
        opacity: 0,
        bottom: 10,
        zIndex: 2,
    },
    fabDeleteToggle: {
        opacity: 1,
    },
    fabMenu: {
        position: 'absolute',
        transition: 'opacity 150ms',
        opacity: 0,
        top: 10,
        right: 10,
        height: FAB_SIZE,
        width: FAB_SIZE,
        zIndex: 2,
    },
    fabMenuToggle: {
        opacity: 1,
    },
}));

export const ImageView = ({
    withFullScreen = false,
    withDelete = false,
    className,
    src,
    onFullScreenClick = () => openBlank(src),
    onDeleteClick = () => undefined,
    onLoadStart,
    onLoadEnd,
    fallback,
    throwError = false,
    disabled = false,

    options,
    onAction = () => undefined,
    payload,
    deps,
    keepMounted,
    BeforeContent,
    AfterContent,

    ...otherProps
}: IImageViewProps) => {
    const { classes } = useStyles();

    const [toggle, setToggle] = useState(false);
    const [hover, setHover] = useState(false);

    return (
        <Box
            className={classNames(className, classes.root)}
            onMouseEnter={() => {
                if (toggle) {
                    return;
                }
                setHover(true);
            }}
            onMouseLeave={() => {
                if (toggle) {
                    return;
                }
                setHover(false);
            }}
            {...otherProps}
        >
            <div className={classes.container}>
                <img
                    className={classes.content}
                    crossOrigin="anonymous"
                    loading="lazy"
                    src={src}
                />
            </div>
            {!!options?.length && (
                <ActionMenu
                    className={classNames(classes.fabMenu, {
                        [classes.fabMenuToggle]: toggle || hover,
                    })}
                    options={options}
                    disabled={disabled}
                    onToggle={(toggle) => {
                        setToggle(toggle);
                        setHover(false);
                    }}
                    onAction={onAction}
                    payload={payload}
                    deps={deps}
                    keepMounted={keepMounted}
                    BeforeContent={BeforeContent}
                    AfterContent={AfterContent}
                />
            )}
            {withDelete && (
                <ActionFab
                    className={classNames(classes.fabDelete, {
                        [classes.fabDeleteToggle]: toggle || hover,
                    })}
                    disabled={disabled}
                    sx={{
                        right: withFullScreen ? 68 : 10,
                    }}
                    color="primary"
                    size={FAB_SIZE}
                    onClick={onDeleteClick}
                    onLoadStart={onLoadStart}
                    onLoadEnd={onLoadEnd}
                    fallback={fallback}
                    throwError={throwError}
                >
                    <DeleteIcon color="inherit" />
                </ActionFab>
            )}
            {withFullScreen && (
                <ActionFab
                    className={classNames(classes.fabFullscreen, {
                        [classes.fabFullscreenToggle]: toggle || hover,
                    })}
                    disabled={disabled}
                    color="primary"
                    size={FAB_SIZE}
                    onClick={onFullScreenClick}
                    onLoadStart={onLoadStart}
                    onLoadEnd={onLoadEnd}
                    fallback={fallback}
                    throwError={throwError}
                >
                    <FullscreenIcon color="inherit" />
                </ActionFab>
            )}
        </Box>
    );
};

export default ImageView;
