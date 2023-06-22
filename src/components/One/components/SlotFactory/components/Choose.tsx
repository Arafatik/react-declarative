import * as React from 'react';
import { useState, forwardRef } from 'react';

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

import ActionButton from '../../../../ActionButton';
import Async from '../../../../Async';

import { IChooseSlot } from '../../../slots/ChooseSlot';

import { useOnePayload } from '../../../context/PayloadProvider';
import { useOneState } from '../../../context/StateProvider';

const LOADING_LABEL = 'Loading';

export const Choose = ({
    invalid,
    value,
    disabled,
    readonly,
    description = "",
    outlined = true,
    title = "",
    placeholder = "No Choose chosen",
    dirty,
    loading: upperLoading,
    inputRef,
    onChange,
    choose = () => "unknown",
    tr = (value) => value,
    name,
}: IChooseSlot) => {
    const [currentLoading, setCurrentLoading] = useState(false);
    const payload = useOnePayload();
    const { object } = useOneState();

    const loading = upperLoading || currentLoading;

    const Input: React.FC<any> = forwardRef(({ value, ...rest }, ref) => (
        <Async payload={value} Loader={() => <input {...rest} readOnly ref={ref} value={LOADING_LABEL} type="text" />}>
            {async () => {
                const label = value ? await tr(value, object, payload) : 'Not chosen';
                return (
                    <input {...rest} readOnly ref={ref} value={label} type="text" />
                );
            }}
        </Async>
    ));

    return (
        <TextField
            sx={{ flex: 1, pointerEvents: 'none' }}
            name={name}
            inputRef={inputRef}
            variant={outlined ? "outlined" : "standard"}
            helperText={(dirty && invalid) || description}
            error={dirty && invalid !== null}
            InputProps={{
                readOnly: readonly,
                inputComponent: Input,
                endAdornment: (
                    <InputAdornment position="end">
                        <ActionButton
                            sx={{ pointerEvents: 'all' }}
                            disabled={loading}
                            variant="outlined"
                            size="small"
                            color={value ? "secondary" : "primary"}
                            onLoadStart={() => setCurrentLoading(true)}
                            onLoadEnd={() => setCurrentLoading(false)}
                            onClick={async () => {
                                if (value) {
                                    onChange(null);
                                    return;
                                }
                                const pendingValue = await choose(object, payload);
                                onChange(pendingValue);
                            }}
                        >
                            {value && "Deselect"}
                            {!value && "Choose"}
                        </ActionButton>
                    </InputAdornment>
                ),
            }}
            InputLabelProps={{
                shrink: true,
            }}
            value={value || ""}
            placeholder={placeholder}
            label={title}
            disabled={disabled}
        />
    );
}

export default Choose;
