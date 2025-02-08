import React, { FC, useEffect, useRef, useState } from 'react';

import { findDOMNode } from 'react-dom';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';

import { Point } from '../../entities/canvas/point';
import { getMapOilReserves } from '../../gateway';
import { round2 } from '../../helpers/math';
import { isNullOrEmpty } from '../../helpers/ramda';

import css from './mapCanvas.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

const defaultTopOffset = 0;

export interface Reserves {
    geologicalReserves: number;
    recoverableReserves: number;
    sumOilProductionTonnesMonth: number;
}

export enum MapOilReservesResultType {
    Input = 1,
    Prediction = 2,
    Proxy = 3
}

export interface OilReservesProps {
    disable?: boolean;
    width?: number;
    polygon?: Point[];
    productionObjectId: number;
    plastId: number;
    scenarioId?: number;
    subScenarioId?: number;
    dt: Date;
    resultType: number;
}

export const OilReserves: FC<OilReservesProps> = (p: OilReservesProps) => {
    const { t } = useTranslation();

    const el = useRef(null);

    const [reserves, setReserves] = useState<Reserves>(null);

    // TODO: проверить правильность использования хука - нужен массив зависимостей вторым параметром
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (isNullOrEmpty(p.polygon)) {
            ReactTooltip.hide();
            setReserves(null);
            return;
        }

        loadReserves(p);
        // eslint-disable-next-line react/no-find-dom-node
        ReactTooltip.show(findDOMNode(el.current) as Element);
    });

    const tooltipContent = () => {
        if (!reserves) {
            return <div>Загрузка...</div>;
        }

        return (
            <p>
                {reserves.geologicalReserves ? (
                    <div>
                        Геологические запасы нефти: <strong>{round2(reserves.geologicalReserves)}</strong> тыс.т
                    </div>
                ) : null}
                {reserves.recoverableReserves ? (
                    <div>
                        Извлекаемые запасы нефти: <strong>{round2(reserves.recoverableReserves)}</strong> тыс.т
                    </div>
                ) : null}
                {reserves.sumOilProductionTonnesMonth ? (
                    <div>
                        {t(dict.common.params.accumulatedOilProduction)}:{' '}
                        <strong>{round2(reserves.sumOilProductionTonnesMonth)}</strong> тыс.т
                    </div>
                ) : null}
            </p>
        );
    };

    const loadReserves = async (p: OilReservesProps) => {
        if (reserves || p.disable) {
            return;
        }

        const { data } = await getMapOilReserves(p);

        setReserves(data);
    };

    if (p.disable) {
        return null;
    }

    return (
        <>
            <span
                id='span_oil-reserves_tooltip'
                ref={el}
                data-for='oil-reserves-tooltip'
                data-tip='oil-reserves'
                style={{
                    position: 'absolute',
                    left: p.width / 2,
                    top: defaultTopOffset
                }}
            />
            <div className={css.tooltipOilReserves}>
                <ReactTooltip
                    id='oil-reserves-tooltip'
                    className={css.reactTooltip__status}
                    getContent={() => tooltipContent()}
                    effect='solid'
                    place='bottom'
                    border={true}
                    type='info'
                    multiline={true}
                />
            </div>
        </>
    );
};
