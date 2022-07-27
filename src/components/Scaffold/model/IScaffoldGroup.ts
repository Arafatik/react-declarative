import { IMenuOption } from "../../../model/IMenuGroup";

export interface IScaffoldOption<T extends any = string> extends Omit<IMenuOption<T>, keyof {
    disabled: never;
    visible: never;
    roles: never;
    bold: never;
    isBold: never;
    isVisible: never;
    isDisabled: never;
}> {
    disabled?: boolean;
    visible?: boolean;
    roles?: string[];
    bold?: boolean;
}

export interface IScaffoldGroup<T extends any = string> extends IScaffoldOption<T> {
    options?: IScaffoldGroup<T>[];
}

export default IScaffoldGroup;
