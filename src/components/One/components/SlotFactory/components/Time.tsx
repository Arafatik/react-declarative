import * as React from "react";
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import dayjs from "dayjs";

import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

import TimePicker from "../../../../common/TimePicker/TimePicker";

import { ITimeSlot } from "../../../slots/TimeSlot";

import useActualValue from "../../../../../hooks/useActualValue";

import formatText from "../../../../../utils/formatText";
import * as datetime from "../../../../../utils/datetime";

import AlarmIcon from "@mui/icons-material/AlarmOutlined";

const TIME_TEMPLATE = "##:##";
const NEVER_POS = Symbol('never-pos');

const getCaretPos = (element: HTMLInputElement | HTMLTextAreaElement) => {
  return element.selectionStart || element.value.length;
};

export const Time = ({
  invalid,
  value: upperValue,
  disabled,
  readonly,
  description = "",
  outlined = true,
  title = "Text",
  placeholder = datetime.TIME_PLACEHOLDER,
  dirty,
  autoFocus,
  inputRef,
  onChange,
  name,
}: ITimeSlot) => {

  const inputElementRef = useRef<HTMLInputElement | null>();

  const incomingUpdate = useRef(false);
  const outgoingUpdate = useRef(false);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const [value, setValue] = useState(
    datetime.parseTime(upperValue || '') ? upperValue : '',
  );

  const value$ = useActualValue(value);

  useEffect(() => {
    if (outgoingUpdate.current) {
      outgoingUpdate.current = false;
    } else if (datetime.parseTime(upperValue || "")) {
      incomingUpdate.current = true;
      setValue(upperValue);
    } else if (value$.current) {
      incomingUpdate.current = true;
      setValue("");
    }
  }, [upperValue]);

  const upperValue$ = useActualValue(upperValue);

  useEffect(() => {
    if (incomingUpdate.current) {
      incomingUpdate.current = false;
    } else {
      const pendingDate = datetime.parseTime(value || "");
      if (pendingDate) {
        outgoingUpdate.current = true;
        onChange(datetime.serializeTime(pendingDate));
      } else if (upperValue$.current) {
        outgoingUpdate.current = true;
        onChange("");
      }
    }
  }, [value]);

  const handleChange = (value: string) => {
    let result = "";
    for (let i = 0; i !== value.length; i++) {
      result += value[i];
      result = formatText(result, TIME_TEMPLATE, {
        allowed: /\d/,
        symbol: "#",
      });
    }
    caretManager.pos();
    setValue(result);
  };

  const dayjsValue = useMemo(() => {
    if (value) {
      const date = datetime.parseTime(value);
      if (!date) {
        return undefined;
      }
      let now = dayjs();
      now = now.set('hour', date.hour);
      now = now.set('minute', date.minute);
      return now;
    }
    return undefined;
  }, [value]);

  const caretManager = useMemo(() => {
    let lastPos: symbol | number = NEVER_POS;

    const getAdjust = (pos: number) => {
      let adjust = 0;
      for (let i = Math.max(pos - 1, 0); i !== TIME_TEMPLATE.length; i++) {
        const char = TIME_TEMPLATE[i];
        if (char === '#') {
          break;
        }
        adjust += 1;
      }
      return adjust;
    };

    return {
      render: () => {
        const { current: input } = inputElementRef;
        if (typeof lastPos === 'number') {
          input?.setSelectionRange(lastPos, lastPos);
          lastPos = NEVER_POS;
        }
      },
      pos: () => {
        const { current: input } = inputElementRef;
        if (input) {
          lastPos = getCaretPos(input);
          lastPos += getAdjust(lastPos);
        }
        return lastPos;
      },
    }
  }, []);

  useLayoutEffect(() => {
    const { current: input } = inputElementRef;
    const handler = () => caretManager.pos();
    input && input.addEventListener('keyup', handler);
    input && input.addEventListener('click', handler);
    return () => {
      input && input.removeEventListener('keyup', handler);
      input && input.removeEventListener('click', handler);
    };
  }, [inputElementRef.current]);

  useLayoutEffect(() => {
    caretManager.render();
  }, [value]);

  return (
    <>
      <TextField
        inputRef={(input: HTMLInputElement | null) => {
          inputElementRef.current = input;
          inputRef && inputRef(input);
        }}
        type="text"
        InputProps={{
          readOnly: readonly,
          autoFocus,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleClick} disabled={disabled} edge="end">
                <AlarmIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        disabled={disabled}
        focused={autoFocus}
        placeholder={placeholder}
        variant={outlined ? "outlined" : "standard"}
        value={value}
        label={title}
        name={name}
        helperText={(dirty && invalid) || description}
        error={dirty && invalid !== null}
        onChange={({ target }) => handleChange(target.value)}
      />
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <TimePicker
          date={dayjsValue}
          onChange={(value: dayjs.Dayjs | null) => {
            if (value) {
              const hour = value.get('hour');
              const minute = value.get('minute');
              setValue(new datetime.Time(hour, minute).toString());
              return;
            }
            setValue(null);
          }}
        />
      </Popover>
    </>
  );
};

export default Time;
