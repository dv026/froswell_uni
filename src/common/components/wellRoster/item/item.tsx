import React, { FC, PropsWithChildren } from 'react';

import i18n from 'i18next';
import { always, cond, equals, isNil, not, pathOr, T } from 'ramda';

import colors from '../../../../../theme/colors';
import { WellBrief } from '../../../entities/wellBrief';
import { isFn, isNullOrEmpty, trueOrNull } from '../../../helpers/ramda';
import { cls } from '../../../helpers/styles';
import { ArrowDirection, ArrowInCircle, ArrowType } from '../../arrowInCircle';
import { EmptyIcon, FavoriteIcon } from '../../customIcon/general';
import { ModelIcon, OilIcon } from '../../customIcon/tree';
import { Expand } from '../../expand/expand';
import { MapeInfo } from '../info/mapeInfo';
import { MultipleCheckbox } from '../info/multipleCheckbox';
import { OilProduction } from '../info/oilProduction/oilProduction';
import { OilWaterScales } from '../info/oilWaterScales';
import { Item, RosterItemEnum } from '../itemEntity';

import css from '../wellRoster.module.less';

import dict from '../../../helpers/i18n/dictionary/main.json';

export interface RosterItemProps {
    // TODO: типизация
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: Item<any>;
    //multiple?: boolean;
    onCheckbox?: (item: WellBrief, checked: boolean, type: RosterItemEnum) => void;
    onClick: (id: WellBrief) => void;
    onExpand: (id: WellBrief, expanded: boolean) => void;
}
export type ItemProps = React.PropsWithChildren<RosterItemProps>;

const RosterItemBody: FC<ItemProps> = (props: ItemProps) => {
    const { item, onExpand } = props;
    const { hidden } = item;

    const isOilfield = item.type === RosterItemEnum.Oilfield;
    const isProductionObject = item.type === RosterItemEnum.ProductionObject;
    const isScenario = item.type === RosterItemEnum.Scenario;

    if (hidden) {
        return null;
    }

    return (
        <div className={css.roster__itemWrapper} expand-title='true'>
            <div className={css.roster__itemBodyWrapper}>
                <MultipleCheckbox {...props} />
                {item.type !== RosterItemEnum.Oilfield ? (
                    !isNullOrEmpty(item.subs) ? (
                        <Latch
                            expanded={!!item.expanded}
                            setExpanded={() => onExpand(item.id, !item.expanded)}
                            nonVisible={isNullOrEmpty(item.subs)}
                            type={ArrowType.Fill}
                        />
                    ) : (
                        <EmptyIcon />
                    )
                ) : null}

                <div
                    className={css.roster__itemBody}
                    onClick={makeClickHandler(props)}
                    title={item.type === RosterItemEnum.Scenario ? item.name : null}
                >
                    <div className={css.roster__itemTitle}>
                        {isOilfield && <OilIcon color='bg.brand' boxSize={8} pr={2} />}
                        {isScenario && <ModelIcon color='bg.brand' boxSize={8} pr={2} />}
                        {isProductionObject ? <b>{itemText(item.type, item.name)}</b> : itemText(item.type, item.name)}
                    </div>
                    {/* <div className={css.roster__itemMarks}>
                        {renderInsimMark(p)}
                        {renderSummMark(p)}
                    </div> */}
                    {item.attributes && item.attributes.weights && (!item.expanded || isNil(item.subs)) ? (
                        <ItemOptions>
                            <OilProduction value={item.attributes.weights.oil.value} />
                            <OilWaterScales className={css.roster__itemScales} weights={item.attributes.weights} />
                        </ItemOptions>
                    ) : null}
                    {item.type === RosterItemEnum.Scenario && item.attributes?.favorite ? (
                        <FavoriteIcon boxSize={6} color={colors.colors.yellow} />
                    ) : null}
                    {item.attributes && item.attributes.mape ? (
                        <MapeInfo label={!!item.expanded} value={item.attributes.mape} />
                    ) : null}
                </div>

                {isOilfield && (
                    <Latch
                        expanded={!!item.expanded}
                        setExpanded={() => onExpand(item.id, !item.expanded)}
                        nonVisible={isNullOrEmpty(item.subs)}
                        type={ArrowType.Chevron}
                    />
                )}
                <div className={css.roster__itemBg}></div>
            </div>
        </div>
    );
};

export const RosterItem: FC<ItemProps> = (props: ItemProps) => {
    const { item, children } = props;

    const hasChildren = children && !isNullOrEmpty(children as unknown[]);

    return (
        <div key={item.id.toString()} className={itemCls(props)}>
            {!hasChildren && <RosterItemBody {...props} />}
            {hasChildren && (
                <>
                    <RosterItemBody {...props} />
                    <Expand expanded={!!item.expanded} removeLatch={true}>
                        {children}
                    </Expand>
                </>
            )}
        </div>
    );
};

RosterItem.displayName = 'RosterItem';

const itemCls = (p: ItemProps) =>
    cls(
        css.roster__item,
        typeCls(p.item.type),
        trueOrNull(isReadonly(p) || p.item.readonly, css.roster__item_readonly),
        trueOrNull(p.item.selected, css.roster__item_selected)
    );

const typeCls = (type: RosterItemEnum) =>
    cond([
        [equals(RosterItemEnum.Oilfield), always(css.roster__item_oilfield)],
        [equals(RosterItemEnum.ProductionObject), always(css.roster__item_object)],
        [equals(RosterItemEnum.Scenario), always(css.roster__item_scenario)],
        [equals(RosterItemEnum.SubScenario), always(css.roster__item_subscenario)]
    ])(type);

const itemText = (type: RosterItemEnum, name: string) =>
    cond([
        [equals(RosterItemEnum.ProductionObject), always(`${name} ${i18n.t(dict.common.object).toLowerCase()}`)],
        [T, always(name)]
    ])(type);

const Latch: React.FC<{ expanded: boolean; setExpanded: () => void; nonVisible: boolean; type: ArrowType }> = ({
    expanded,
    setExpanded,
    nonVisible,
    type
}) => (
    <div className={cls(css.roster__itemArrow, trueOrNull(nonVisible, 'is-non-visible'))} onClick={setExpanded}>
        <ArrowInCircle
            noBorder={true}
            direction={expanded ? ArrowDirection.Bottom : ArrowDirection.Right}
            type={type}
        />
    </div>
);

interface ItemOptionsProps {
    title?: string;
}

const ItemOptions: React.FC<PropsWithChildren<ItemOptionsProps>> = (p: PropsWithChildren<ItemOptionsProps>) => (
    <div className={css.roster__itemOptions}>{p.children}</div>
);

const clickableAttribute = (p: RosterItemProps) => pathOr(null, ['item', 'attributes', 'clickable'], p);
const hasClickableAttribute = (p: RosterItemProps) => not(isNil(clickableAttribute(p)));
const couldBeClicked = (p: RosterItemProps) => (hasClickableAttribute(p) ? clickableAttribute(p) : true);
const makeClickHandler = (p: RosterItemProps) =>
    isFn(p.item.onClick) && couldBeClicked(p) ? () => p.onClick(p.item.id) : null;

const isReadonly = (p: RosterItemProps) => (hasClickableAttribute(p) ? !clickableAttribute(p) : false);
