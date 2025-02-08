import { atom, selector } from 'recoil';

import { isCollapsed } from '../../maintain/enums/listStateEnum';
import { ListStateEnum } from '../enums/listStateEnum';

const setListCollapsed = (collapsed: boolean, manually: boolean = true) =>
    collapsed
        ? manually
            ? ListStateEnum.CollapsedManually
            : ListStateEnum.Collapsed
        : manually
        ? ListStateEnum.ExpandedManually
        : ListStateEnum.Expanded;

export const listState = atom<ListStateEnum>({
    key: 'maintain__listState',
    default: ListStateEnum.Expanded
});

export const listCollapsedSelector = selector<boolean>({
    key: 'maintain__listCollapsedSelector',
    get: ({ get }) => {
        return isCollapsed(get(listState));
    },
    set: ({ set }, value: boolean) => {
        set(listState, setListCollapsed(value));
    }
});
