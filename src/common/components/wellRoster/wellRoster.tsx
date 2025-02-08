/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, memo, useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { Button } from '@chakra-ui/react';
import {
    all,
    any,
    append,
    assoc,
    both,
    cond,
    filter,
    find,
    forEach,
    head,
    includes,
    isNil,
    map,
    not,
    propEq,
    reject,
    T
} from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { listCollapsedSelector } from '../../../maintain/store/list';
import { WellBrief } from '../../entities/wellBrief';
import { PredictionListWell, ProxyListWell, WellModel } from '../../entities/wellModel';
import { shallowEqual } from '../../helpers/compare';
import { isFn, isNullOrEmpty, trueOrNull } from '../../helpers/ramda';
import { cls } from '../../helpers/styles';
import { MenuIcon, PlusIcon } from '../customIcon/general';
import { useDebounce } from '../hooks/useDebounce/useDebounce';
import { ItemProps, RosterItem } from './item/item';
import { Well } from './item/well';
import { Item, RosterItemEnum } from './itemEntity';
import { SearchField } from './searchField';

import css from './wellRoster.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

type UnionListType = WellModel[] | PredictionListWell[] | ProxyListWell[];

interface ClicksProps {
    well?: (x: WellBrief) => void;
    productionObject?: (x: WellBrief) => void;
    scenario?: (x: WellBrief) => void;
    subScenario?: (x: WellBrief) => void;
    oilfield?: (x: WellBrief) => void;
    addOilfield?: () => void;
}

export interface WellRosterProps {
    clicks: ClicksProps;
    expandOnlySelectedNode?: boolean;
    multipleSelection?: boolean;
    selected: WellBrief[];
    showActions?: boolean;
    title: string;
    wells: UnionListType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    makeRows: (x: UnionListType) => Item<any>[];
    onSelectedWells?: (wells: WellBrief[]) => void;
}

export const WellRoster = memo((props: WellRosterProps) => {
    const {
        clicks,
        expandOnlySelectedNode,
        multipleSelection,
        selected,
        showActions,
        title,
        wells,
        makeRows,
        onSelectedWells
    } = props;

    const { t } = useTranslation();

    const [collapsed, setListCollapsed] = useRecoilState(listCollapsedSelector);

    const [search, setSearch] = useState<string>('');
    const [selectedWells, setSelectedWells] = useState<WellBrief[]>([]);
    const [list, updateList] = useState<Item<any>[]>([]);

    const isActiveSearch = !!search;

    const checkSelectedWells = useCallback(
        (items: WellBrief[]) => {
            setSearch('');
            onSelectedWells(items);
        },
        [onSelectedWells]
    );

    const debouncedSelectedWells = useDebounce(checkSelectedWells, 1000);

    const onCheckbox = useCallback(
        (item: WellBrief, checked: boolean, type: RosterItemEnum) => {
            const items = checked ? append(item, selectedWells) : reject(it => shallowEqual(it, item), selectedWells);

            if (items && items.length > 1) {
                setSelectedWells(items);
            } else {
                if (items && items.length === 1 && !shallowEqual(item, head(items))) {
                    detectClicks(clicks).find(x => x[0] === type, clicks)[1](head(items));
                }

                onSelectedWells([]);
            }

            debouncedSelectedWells(items);
        },
        [clicks, debouncedSelectedWells, onSelectedWells, selectedWells]
    );

    const onExpand = useCallback(
        (id: WellBrief, expanded: boolean) => {
            updateList(priv => {
                updateExpanded(id, expanded, expandOnlySelectedNode, priv);
                return [...priv];
            });
        },
        [expandOnlySelectedNode]
    );

    const setItemList = useCallback(() => {
        const items = makeRows(wells || []);

        setUpItems(
            items,
            selectedWells,
            isActiveSearch ? false : expandOnlySelectedNode,
            multipleSelection,
            detectReadonly(clicks),
            detectClicks(clicks),
            onCheckbox,
            onExpand
        );

        const newList = replaceExpanded(items, selectedWells);

        if (search) {
            setWellsHidden(newList, search); // wells
            setWellsHidden(newList, search); // objects
            setWellsHidden(newList, search); // scenarios
            setWellsHidden(newList, search); // oilfields
        }

        updateList(newList);
    }, [
        clicks,
        expandOnlySelectedNode,
        isActiveSearch,
        makeRows,
        multipleSelection,
        onCheckbox,
        onExpand,
        search,
        selectedWells,
        wells
    ]);

    useEffect(() => {
        setItemList();
    }, [
        selectedWells,
        wells,
        expandOnlySelectedNode,
        multipleSelection,
        clicks,
        makeRows,
        onCheckbox,
        onExpand,
        setItemList
    ]);

    useLayoutEffect(() => {
        setSelectedWells(selected);
    }, [selected]);

    const onSearchHandler = useCallback(
        (string: string) => {
            setSearch(string);
        },
        [setSearch]
    );

    return (
        <>
            <div className={cls(css.roster, trueOrNull(collapsed, css.roster_collapsed))}>
                <div className={css.roster__header}>
                    <div className={css.roster__title}>{title}</div>
                    <div className={cls([css.roster__search, search && css.roster__search_active])}>
                        <SearchField text={search} onChange={onSearchHandler} />
                    </div>
                </div>
                {list && <div className={css.roster__list}>{map(x => render(x), list)}</div>}
                {showActions && (
                    <div className={css.roster__actions}>
                        <Button
                            leftIcon={<PlusIcon color='icons.grey' boxSize={7} />}
                            variant='link'
                            onClick={() => clicks.addOilfield()}
                        >
                            {t(dict.common.add)}
                        </Button>
                    </div>
                )}
            </div>
            <div
                className={cls(css.latch, trueOrNull(collapsed, css.latch_collapsed))}
                onClick={() => setListCollapsed(!collapsed)}
            >
                <MenuIcon color='icons.grey' boxSize={7} />
            </div>
        </>
    );
});

const detectReadonly = (clicks: ClicksProps): [RosterItemEnum, boolean][] => [
    [RosterItemEnum.Well, not(isFn(clicks.well))],
    [RosterItemEnum.SubScenario, not(isFn(clicks.subScenario))],
    [RosterItemEnum.Scenario, not(isFn(clicks.scenario))],
    [RosterItemEnum.ProductionObject, not(isFn(clicks.productionObject))],
    [RosterItemEnum.Oilfield, not(isFn(clicks.oilfield))]
];

const detectClicks = (clicks: ClicksProps): [RosterItemEnum, (x: WellBrief) => void][] => [
    [RosterItemEnum.Well, isFn(clicks.well) ? clicks.well : null],
    [RosterItemEnum.SubScenario, isFn(clicks.subScenario) ? clicks.subScenario : null],
    [RosterItemEnum.Scenario, isFn(clicks.scenario) ? clicks.scenario : null],
    [RosterItemEnum.ProductionObject, isFn(clicks.productionObject) ? clicks.productionObject : null],
    [RosterItemEnum.Oilfield, isFn(clicks.oilfield) ? clicks.oilfield : null]
];

const setUpInner = (
    item: Item<null>,
    selected: WellBrief[],
    expandOnlySelectedNode: boolean,
    multipleSelection: boolean,
    readonlyTypes: [RosterItemEnum, boolean][],
    clicks: [RosterItemEnum, (x: WellBrief) => void][],
    onCheckbox: (item: WellBrief, checked: boolean, type: RosterItemEnum) => void,
    onExpand: (id: WellBrief, expanded: boolean) => void
) => {
    item.selected = any(it => it.eqTo(item.id), selected);
    item.readonly = (find(x => x[0] === item.type, readonlyTypes) || [null, true])[1];
    item.expanded = expandOnlySelectedNode ? containsSelected(item, selected) : true;
    item.allowChecked = getSelectedType(selected) === item.type;
    item.multipleSelection = multipleSelection;
    item.onClick = (find(x => x[0] === item.type, clicks) || [null, null])[1];
    item.onCheckbox = onCheckbox;
    item.onExpand = onExpand;

    if (!isNullOrEmpty(item.subs)) {
        setUpItems(
            item.subs,
            selected,
            expandOnlySelectedNode,
            multipleSelection,
            readonlyTypes,
            clicks,
            onCheckbox,
            onExpand
        );
    }
};

const setUpItems = (
    items: Item<null>[],
    selected: WellBrief[],
    expandOnlySelectedNode: boolean,
    multipleSelection: boolean,
    readonlyTypes: [RosterItemEnum, boolean][],
    clicks: [RosterItemEnum, (x: WellBrief) => void][],
    onCheckbox: (item: WellBrief, checked: boolean, type: RosterItemEnum) => void,
    onExpand: (id: WellBrief, expanded: boolean) => void
): void => {
    if (isNil(items)) {
        return;
    }

    forEach(x => {
        setUpInner(x, selected, expandOnlySelectedNode, multipleSelection, readonlyTypes, clicks, onCheckbox, onExpand);
    }, items);
};

const eqByType = (val: RosterItemEnum) => (x: Item<any>) => propEq('type', val)(x);

const renderInner = (El: FC<ItemProps>, item: Item<any>) => {
    const { id, subs, expanded, onClick, onCheckbox, onExpand } = item;

    return (
        <El key={id.toString()} item={item} onClick={onClick} onCheckbox={onCheckbox} onExpand={onExpand}>
            {subs && !!expanded && map(it => render(it), subs)}
        </El>
    );
};

const render = (item: Item<any>) =>
    cond([
        [eqByType(RosterItemEnum.Well), (x: Item<any>) => renderInner(Well, x)],
        [T, (x: Item<any>) => renderInner(RosterItem, x)]
    ])(item);

const replaceExpanded = (items: Item<null>[], selected: WellBrief[]) =>
    map(x => replaceExpandedItem(x, selected), items);

const replaceExpandedItem = (x: Item<any>, selected: WellBrief[]) => {
    if (!x.subs) {
        // элемент не имеет дочерних элементов, поэтому его состояние expanded/collapsed не актуально, оно не отображается
        return x;
    }

    x.subs = replaceExpanded(x.subs, selected);
    const expanded = any(x => !!x.expanded || !!x.selected, x.subs);

    return !!expanded !== !!x.expanded
        ? assoc('expanded', expanded)(x) // expanded состояние изменилось, изменить его и весь объект
        : x; // expanded состояние не изменилось, вернуть объект как есть
};

const updateExpanded = (id: WellBrief, expanded: boolean, expandOnlySelectedNode: boolean, list: Item<any>[]) => {
    forEach(item => updateExpandedInner(id, expanded, expandOnlySelectedNode, item), list);
};

const updateExpandedInner = (id: WellBrief, expanded: boolean, expandOnlySelectedNode: boolean, item: Item<any>) => {
    if (item.id.toString() === id.toString()) {
        item.expanded = expanded;

        if (!expandOnlySelectedNode || !expanded) {
            // прекратить обход дерева, так как действие закончено:
            //      - если при открытии узла не указана настройка по сворачиванию остальных узлов
            //      - если узел сворачивается
            return;
        }
    } else if (expandOnlySelectedNode && expanded) {
        // если указана настройка по сворачиванию остальных узлов, то свернуть неактивный узел
        item.expanded = containsSelected(item, [id]);
    }

    if (isNullOrEmpty(item.subs)) {
        // у узла нет дочерних, действие в рамках этого узла закончено
        return;
    }

    // пройти по дочерним узлам
    updateExpanded(id, expanded, expandOnlySelectedNode, item.subs);
};

const containsSelected = (item: Item<any>, selected: WellBrief[]) => {
    if (any(it => it.eqTo(item.id), selected)) {
        return true;
    }

    return passThrough(false, selected, item.subs);
};

const passThrough = (accumulator, selected, items: Item<any>[]) => {
    items = items || [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].id.eqTo(selected)) {
            return true;
        } else {
            const inner = passThrough(accumulator, selected, items[i].subs);
            if (inner === true) {
                return true;
            }
        }
    }

    return false;
};

const getSelectedType = (selected: WellBrief[]) => {
    if (isNullOrEmpty(selected)) {
        return null;
    }

    const well = head(selected);

    if (well.id) {
        return RosterItemEnum.Well;
    } else if (well.subScenarioId) {
        return RosterItemEnum.SubScenario;
    } else if (well.scenarioId) {
        return RosterItemEnum.Scenario;
    } else if (well.prodObjId) {
        return RosterItemEnum.ProductionObject;
    } else if (well.oilFieldId) {
        return RosterItemEnum.Oilfield;
    }

    return null;
};

const setWellsHidden = (items: Item<null>[], search: string) => {
    if (isNil(items)) {
        return;
    }

    forEach(x => setWellsHiddenInner(x, search), items);
};

const setWellsHiddenInner = (item: Item<null>, search: string) => {
    if (item.type === RosterItemEnum.Well) {
        item.hidden = both(
            x => !isNullOrEmpty(x),
            (s: string) => !includes(s, item.name)
        )(search);
    } else if (item.type === RosterItemEnum.ProductionObject) {
        item.hidden = filter(it => it.hidden !== true, item.subs).length === 0;
        setWellsHidden(item.subs, search);
    } else if (!isNullOrEmpty(item.subs)) {
        item.hidden = filter(it => it.hidden !== true, item.subs).length === 0;
        setWellsHidden(item.subs, search);
    }
};
