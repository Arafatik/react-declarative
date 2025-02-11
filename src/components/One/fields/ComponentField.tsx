import * as React from 'react';
import { Fragment } from 'react';
import { useState, useLayoutEffect } from 'react';

import { makeStyles } from "../../../styles";

import Box from '@mui/material/Box';

import makeField from '../components/makeField';

import { useOneState } from '../../../components/One/context/StateProvider';
import { useOnePayload } from '../../../components/One/context/PayloadProvider';

import IField from '../../../model/IField';
import IAnything from '../../../model/IAnything';
import IManaged, { PickProp } from '../../../model/IManaged';

import classNames from '../../../utils/classNames';
import deepClone from '../../../utils/deepClone';
import objects from '../../../utils/objects';
import arrays from '../../../utils/arrays';

type FieldIgnoreParam = keyof Omit<IManaged, keyof IField> | "readonly";

const FIELD_NEVER_MARGIN = '0';

const FIELD_INTERNAL_PARAMS: FieldIgnoreParam[] = [
    "dirty",
    "fallback",
    "readonly",
    "invalid",
    "loading",
    "object",
    "onChange",
    "prefix",
    "value",
];

export interface IComponentFieldProps<Data = IAnything, Payload = IAnything> {
    element?: PickProp<IField<Data, Payload>, 'element'>;
    groupRef?: PickProp<IField<Data, Payload>, 'groupRef'>;
}

interface IComponentFieldPrivate<Data = IAnything> {
    object: PickProp<IManaged<Data>, 'object'>;
    disabled: PickProp<IManaged<Data>, 'disabled'>;
    readonly: PickProp<IManaged<Data>, 'readonly'>;
}

const useStyles = makeStyles()({
    root: {
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        '& > *': {
            flex: 1,
        },
    },
    disabled: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
    readonly: {
        pointerEvents: 'none',
    },
});

export const ComponentField = ({
    disabled,
    readonly,
    element: Element = () => <Fragment />,
    object,
    ...otherProps
}: IComponentFieldProps & IComponentFieldPrivate) => {

    const { classes } = useStyles();

    const [ node, setNode ] = useState<JSX.Element | null>(null);
    const { setObject } = useOneState();
    const _payload = useOnePayload();

    const handleChange = (object: unknown) => setObject(deepClone(object), {});

    useLayoutEffect(() => {
        const _fieldParams = Object.entries(otherProps as IField)
            .filter(([key]) => !FIELD_INTERNAL_PARAMS.includes(key as FieldIgnoreParam))
            .reduce((acm, [key, value]) => ({ ...acm, [key]: value }), {}) as IField;
        const onChange = (data: Record<string, any>) => handleChange({ ...objects(object), ...data });
        const _fieldData = arrays(object);
        const props = { ..._fieldData, onChange, _fieldParams, _fieldData, _payload };
        setNode(() => (
            <Element
                {...props}
            />
        ));
    }, [object]);

    return (
        <Box
            className={classNames({
                [classes.disabled]: disabled,
                [classes.readonly]: readonly,
            })}
        >
            {node}
        </Box>
    );
};

ComponentField.displayName = 'ComponentField';

export default makeField(ComponentField, {
    defaultProps: {
        fieldRightMargin: FIELD_NEVER_MARGIN,
        fieldBottomMargin: FIELD_NEVER_MARGIN,
    },
    skipDirtyClickListener: true,
    skipFocusReadonly: true,
    skipDebounce: true,
});
