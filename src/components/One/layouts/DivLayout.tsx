import * as React from 'react';

import IField from '../../../model/IField';
import IEntity from '../../../model/IEntity';
import IAnything from '../../../model/IAnything';
import { PickProp } from '../../../model/IManaged';

import makeLayout from '../components/makeLayout/makeLayout';

export interface IDivLayoutProps<Data = IAnything, Payload = IAnything> {
    className?: PickProp<IField<Data, Payload>, 'className'>;
    style?: PickProp<IField<Data, Payload>, 'style'>;
}

interface IDivLayoutPrivate<Data = IAnything> extends IEntity<Data> {
    children: React.ReactNode;
}

export const DivLayout = <Data extends IAnything = IAnything>({
    children,
    className,
    style,
}: IDivLayoutProps<Data> & IDivLayoutPrivate<Data>) => (
    <div {...{className, style}}>
        {children}
    </div>
);

DivLayout.displayName = 'DivLayout';

export default makeLayout(DivLayout) as typeof DivLayout;
