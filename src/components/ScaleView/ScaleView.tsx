import * as React from 'react';
import { useEffect, useState } from 'react';

import { makeStyles } from '../../styles';
import { debounce } from '@mui/material';

import Box from '@mui/material/Box';

import classNames from '../../utils/classNames';

const SCALE_CONTAINER = 'react-declarative__scaleContainer';
const SCALE_DEBOUNCE = 1_000;

interface IScaleViewProps {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    stretch?: boolean;
    center?: boolean;
}

const useStyles = makeStyles()({
    root: {
        position: 'relative',
        overflow: 'hidden',
    },
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        minHeight: '100%',
        minWidth: '100%',
        '& > *:nth-of-type(1)': {
            transformOrigin: 'top left',
        },
    },
    stretch: {
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        '& > *:nth-of-type(1)': {
            flex: 1,
        },
    },
    center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export const ScaleView = ({
    children,
    className,
    style,
    stretch = false,
    center = false,
}: IScaleViewProps) => {
    const { classes } = useStyles();

    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);

    const [transform, setTransform] = useState('none');
    const [marginBottom, setMarginBottom] = useState('inherit');
    const [marginRight, setMarginRight] = useState('inherit');

    useEffect(() => {

        const handleSize = () => {
            if (!rootRef) {
                return;
            }
            const contentRef = rootRef.querySelector(`.${SCALE_CONTAINER} > *:nth-of-type(1)`);
            if (!contentRef) {
                return;
            }
            const { height: rootHeight, width: rootWidth } = rootRef.getBoundingClientRect();
            const { clientHeight: contentHeight, clientWidth: contentWidth } = contentRef;

            if (rootHeight > contentHeight && rootWidth > contentWidth) {
                setTransform('none');
                setMarginBottom('inherit');
                setMarginRight('inherit');
                return
            }

            const scaleY = Math.min(1.0, rootHeight / contentHeight);
            const scaleX = Math.min(1.0, rootWidth / contentWidth);
            const scaleAdjust = Number(Math.min(scaleX, scaleY).toFixed(2));

            setMarginBottom(`-${(contentHeight * (1 - scaleAdjust))}px`);
            setMarginRight(`-${(contentWidth * (1 - scaleAdjust))}px`);
            setTransform(`scale(${scaleAdjust})`);

        };

        const handleSizeD = debounce(handleSize, SCALE_DEBOUNCE);

        const observer = new ResizeObserver(handleSizeD);

        if (rootRef) {
            observer.observe(rootRef);
            handleSize();
        }

        return () => {
            rootRef && observer.unobserve(rootRef);
            handleSizeD.clear();
        };

    }, [rootRef]);

    const handleRef = (rootRef: HTMLDivElement | null) => {
        setRootRef(rootRef);
    };

    return (
        <div
            className={classNames(className, classes.root)}
            ref={handleRef}
            style={style}
        >
            <Box
                className={classNames(classes.container, SCALE_CONTAINER, {
                    [classes.stretch]: stretch,
                    [classes.center]: center,
                })}
                sx={{
                    '& > *:nth-of-type(1)': {
                        transform,
                        marginBottom,
                        marginRight,
                    },
                }}
            >
                {children}
            </Box>
        </div>
    );

};

export default ScaleView;
