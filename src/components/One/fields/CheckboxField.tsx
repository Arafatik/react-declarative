import * as React from 'react';

import CheckBox from '../../../components/One/slots/CheckBoxSlot';

import makeField from "../components/makeField";

import IManaged, { PickProp } from '../../../model/IManaged';
import IAnything from '../../../model/IAnything';
import IField from '../../../model/IField';

export interface ICheckboxFieldProps<Data = IAnything, Payload = IAnything> {
  title?: PickProp<IField<Data, Payload>, 'title'>;
  readonly?: PickProp<IField<Data, Payload>, "readonly">;
  disabled?: PickProp<IField<Data, Payload>, "disabled">;
  groupRef?: PickProp<IField<Data, Payload>, 'groupRef'>;
}

export interface ICheckboxFieldPrivate<Data = IAnything>  {
  value: PickProp<IManaged<Data>, 'value'>;
  onChange: PickProp<IManaged<Data>, 'onChange'>;
}

export const CheckboxField = ({
  disabled,
  value,
  readonly,
  onChange,
  title
}: ICheckboxFieldProps & ICheckboxFieldPrivate) => (
  <CheckBox
    disabled={disabled}
    value={value}
    readonly={readonly}
    onChange={onChange}
    title={title}
  />
);

CheckboxField.displayName = 'CheckboxField';

export default makeField(CheckboxField, {
  skipDebounce: true,
  skipDirtyClickListener: true,
});
