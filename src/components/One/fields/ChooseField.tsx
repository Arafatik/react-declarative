import * as React from "react";

import Choose from '../../../components/One/slots/ChooseSlot';

import makeField from "../components/makeField";

import IManaged, { PickProp } from "../../../model/IManaged";
import IAnything from "../../../model/IAnything";
import IField from "../../../model/IField";

export interface IChooseFieldProps<Data = IAnything, Payload = IAnything> {
  description?: PickProp<IField<Data, Payload>, "description">;
  outlined?: PickProp<IField<Data, Payload>, "outlined">;
  title?: PickProp<IField<Data, Payload>, "title">;
  placeholder?: PickProp<IField<Data, Payload>, "placeholder">;
  readonly?: PickProp<IField<Data, Payload>, "readonly">;
  disabled?: PickProp<IField<Data, Payload>, "disabled">;
  groupRef?: PickProp<IField<Data, Payload>, 'groupRef'>;
  inputRef?: PickProp<IField<Data, Payload>, 'inputRef'>;
  choose?: PickProp<IField<Data, Payload>, 'choose'>;
  tr?: PickProp<IField<Data, Payload>, 'tr'>;
}

export interface IChooseFieldPrivate<Data = IAnything> {
  onChange: PickProp<IManaged<Data>, "onChange">;
  invalid: PickProp<IManaged<Data>, "invalid">;
  value: PickProp<IManaged<Data>, "value">;
  loading: PickProp<IManaged<Data>, "loading">;
  disabled: PickProp<IManaged<Data>, "disabled">;
  dirty: PickProp<IManaged<Data>, "dirty">;
  name: PickProp<IManaged<Data>, "name">;
}

export const ChooseField = ({
  invalid,
  value,
  disabled,
  readonly,
  description = "",
  outlined = true,
  title = "",
  placeholder = "",
  choose,
  tr,
  dirty,
  loading,
  onChange,
  inputRef,
  name,
}: IChooseFieldProps & IChooseFieldPrivate) => (
  <Choose
    inputRef={inputRef}
    invalid={invalid}
    value={value}
    readonly={readonly}
    disabled={disabled}
    description={description}
    outlined={outlined}
    title={title}
    placeholder={placeholder}
    choose={choose}
    tr={tr}
    dirty={dirty}
    loading={loading}
    onChange={onChange}
    name={name}
  />
);

ChooseField.displayName = 'ChooseField';

export default makeField(ChooseField, {
  skipDirtyClickListener: true,
  skipFocusReadonly: true,
  skipDebounce: true,
});
