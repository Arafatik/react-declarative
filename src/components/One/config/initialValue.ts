import FieldType from '../../../model/FieldType';

const initialValueMap = {
  [FieldType.Checkbox]: false,
  [FieldType.Radio]: "",
  [FieldType.Text]: "",
  [FieldType.Switch]: false,
  [FieldType.Progress]: 1.0,
  [FieldType.Slider]: 0,
  [FieldType.Combo]: null,
  [FieldType.Items]: null,
  [FieldType.Rating]: 3,
  [FieldType.Typography]: '',
  [FieldType.Date]: '',
  [FieldType.Time]: '',
  [FieldType.File]: null,
  [FieldType.Choose]: null,
  [FieldType.Component]: undefined,
  [FieldType.Complete]: '',
};

type InitialValue = typeof initialValueMap;

export const initialValue = (type: FieldType): InitialValue[keyof InitialValue] | string => {
  const initialValue = initialValueMap[type];
  if (initialValue === undefined) {
    console.warn(`react-declarative One initialValue unknown type ${type}`);
    return '';
  } else {
    return initialValue;
  }
};

export default initialValue;
