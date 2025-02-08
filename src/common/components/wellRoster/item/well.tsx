import React, { FC, useCallback } from 'react';
import { PropsWithChildren } from 'react';

import { always, cond, equals, isNil, T } from 'ramda';

import { WellTypeEnum } from '../../../enums/wellTypeEnum';
import { isNullOrEmpty, trueOrNull } from '../../../helpers/ramda';
import { cls, pc } from '../../../helpers/styles';
import {
    DownIcon,
    DropAndDownIcon,
    DropIcon,
    DropTimeIcon,
    HorisontIcon,
    WellMinusIcon,
    WellPlayIcon,
    WellPlaySimpleIcon,
    WellStopIcon
} from '../../customIcon/tree';
import { MapeInfo } from '../info/mapeInfo';
import { MultipleCheckbox } from '../info/multipleCheckbox';
import { OilProduction } from '../info/oilProduction/oilProduction';
import { OilWaterScales } from '../info/oilWaterScales';
import { MarkEnum } from '../itemEntity';
import { ItemProps } from './item';

import css from '../wellRoster.module.less';

export const Well: FC<ItemProps> = (props: ItemProps) => {
    const { item, onClick } = props;
    const { id, name, hidden, selected, attributes } = item;

    const onClickHandler = useCallback(() => {
        onClick(id);
    }, [id, onClick]);

    if (hidden) {
        return null;
    }

    return (
        <div
            key={id.toString()}
            className={cls(
                css.roster__item,
                css.roster__item_well,
                trueOrNull(hidden, css.roster__item_hidden),
                trueOrNull(selected, css.roster__item_selected)
            )}
        >
            <div className={css.roster__itemBodyWrapper}>
                <MultipleCheckbox {...props} />
                <div className={css.roster__itemBody} onClick={onClickHandler}>
                    <div className={css.wellType}>
                        {React.cloneElement(wellTypeIcon(attributes.type), { color: 'bg.brand', boxSize: 7 })}
                    </div>
                    <div className={css.wellName}>
                        <div className={css.wellName__text}>{name}</div>
                        {attributes.horisontState ? <HorisontIcon ml={1} boxSize={5} color='bg.brand' /> : null}
                    </div>
                    {!isNullOrEmpty(attributes?.marks) ? (
                        <div className={css.wellMarks}>
                            {React.cloneElement(markIcon(attributes.marks[0], attributes.marks[1]), {
                                boxSize: 8
                            })}
                        </div>
                    ) : null}
                    {attributes && attributes.oilError && <WellError value={attributes.oilError} />}
                    {attributes && attributes.weights && (
                        <WellOptions>
                            <OilProduction value={attributes.weights.oil.value} />
                            <OilWaterScales className={css.wellScales} weights={attributes.weights} />
                        </WellOptions>
                    )}
                    {typeof attributes?.mape !== 'undefined' && <MapeInfo value={attributes?.mape} />}
                </div>
            </div>
            <div className={css.roster__itemBg} />
        </div>
    );
};

Well.displayName = 'RosterItem_Well';

const wellTypeIcon = (type: WellTypeEnum) =>
    cond([
        [equals(WellTypeEnum.Oil), always(<DropIcon />)],
        [equals(WellTypeEnum.Injection), always(<DownIcon />)],
        [equals(WellTypeEnum.Mixed), always(<DropAndDownIcon />)],
        [equals(WellTypeEnum.Piezometric), always(<DropTimeIcon />)],
        [T, always(null)]
    ])(type);

const markIcon = (state: MarkEnum, variation: MarkEnum) => {
    if (state === MarkEnum.StateActive) {
        if (variation === MarkEnum.VariationsPositive) {
            return <WellPlayIcon color='icons.green' />;
        }

        if (variation === MarkEnum.VariationsNegative) {
            return <WellPlayIcon color='icons.red' />;
        }

        return <WellPlaySimpleIcon color='icons.grey' />;
    } else if (state === MarkEnum.StateStopped) {
        return <WellStopIcon color='icons.grey' />;
    }

    return <WellMinusIcon color='icons.grey' />;
};

interface WellErrorProps {
    value: number;
}

const text = (value: number) => (isNil(value) ? '' : `${pc(Math.round(value))}`);
const WellError: React.FC<WellErrorProps> = ({ value }: WellErrorProps) => (
    <div className={css.wellError}>
        {text(value)}
        <div className={css.wellError__mape}>mape</div>
    </div>
);

interface WellOptionsProps {
    title?: string;
}

const WellOptions: React.FC<PropsWithChildren<WellOptionsProps>> = (p: PropsWithChildren<WellOptionsProps>) => (
    <div className={css.wellOptions}>{p.children}</div>
);
