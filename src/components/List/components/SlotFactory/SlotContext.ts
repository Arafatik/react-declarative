import { createContext } from 'react';

import BodyRow from './components/BodyRow';
import CheckboxCell from './components/CheckboxCell';
import CommonCell from './components/CommonCell';
import HeadRow from './components/HeadRow';
import ActionAdd from './components/ActionAdd';
import ActionMenu from './components/ActionMenu';
import ActionFab from './components/ActionFab';

import ChipListSlot from './components/ChipListSlot';
import ActionListSlot from './components/ActionListSlot';
import FilterListSlot from './components/FilterListSlot';
import OperationListSlot from './components/OperationListSlot';
import SearchSlot from './components/SearchSlot';

import ISlotFactoryContext from './ISlotFactoryContext';

export const defaultSlots = {
    BodyRow,
    CheckboxCell,
    CommonCell,
    HeadRow,
    ActionAdd,
    ActionMenu,
    ActionFab,
    ChipListSlot,
    ActionListSlot,
    FilterListSlot,
    OperationListSlot,
    SearchSlot,
};

export const SlotContext = createContext<ISlotFactoryContext>(defaultSlots);

export default SlotContext;
