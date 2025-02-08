import React, { FC, useEffect, useState } from 'react';

import i18n from 'i18next';
import * as R from 'ramda';
import { always, cond, equals, filter, find, head, map, T } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { RadioGroup, RadioGroupOption } from '../../../../common/components/radioGroup';
import { SelectPlastSimple } from '../../../../common/components/selectPlastSimple';
import { KeyValue } from '../../../../common/entities/keyValue';
import { findOrDefault, isNullOrEmpty } from '../../../../common/helpers/ramda';
import { cls } from '../../../../common/helpers/styles';
import { NeighborINSIM, NeighborTypeEnum } from '../../../entities/insim/well';
import { NeighborModel } from '../../../entities/neighborModel';
import { PlastInfo } from '../../../entities/report/plastInfo';
import { GraphViewParam } from '../enums/graphViewParam';
import { modeName } from '../helpers/modeNameManager';
import { viewTypeSelector } from '../store/viewType';

import css from './common.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export interface ChartSelectorBaseProps {
    currentId: string;
    onClick: (x: string) => void;
}

interface ChartSelectorProps extends ChartSelectorBaseProps {
    neighborInfos: NeighborModel[];
    neighbors: NeighborINSIM[];
    saturationNeighbors: NeighborINSIM[];
    plasts: PlastInfo[];
    wellName: string;
}

export const bestByPlastId = (paramName: string): string => `${paramName}_bestby`;
export const overAllPlastsId = (paramName: string): string => `${paramName}_all`;

export const ChartSelector: FC<ChartSelectorProps> = (props: ChartSelectorProps) => {
    const { t } = useTranslation();

    const viewType = useRecoilValue(viewTypeSelector);

    useEffect(() => {
        setCurrentPlast(head(props.plasts));
    }, [viewType, props.plasts]);

    const [currentPlast, setCurrentPlast] = useState<PlastInfo>(head(props.plasts));

    const byPlastId = (paramName: string): string => `${paramName}-${currentPlast.id}`;

    const setPlastById = (plastId: number) => setCurrentPlast(find(it => it.id === plastId, props.plasts));

    const renderInsimParamGroup = (paramName: string, title: string): JSX.Element => {
        return (
            <>
                <div className={css.results__paramGroup}>{title}:</div>
                {renderGroup([
                    new RadioGroupOption(overAllPlastsId(paramName), t(dict.common.dataBy.overAllPlasts)),
                    new RadioGroupOption(bestByPlastId(paramName), t(dict.common.dataBy.bestByPlasts)),
                    new RadioGroupOption(byPlastId(paramName), t(dict.common.dataBy.plasts))
                ])}
                {renderByPlastSelector(paramName)}
            </>
        );
    };

    const renderByPlastSelector = (paramName: string): JSX.Element => {
        return (
            <>
                <div className={cls([css.results__param, css.results__param_offset])}>
                    <SelectPlastSimple
                        selected={currentPlast.id}
                        dictionary={map(x => new KeyValue(x.id, x.name), props.plasts)}
                        disabled={props.currentId !== modeName(paramName, currentPlast.id)}
                        onChange={x => {
                            props.onClick(modeName(paramName, x));
                            setPlastById(x);
                        }}
                    />
                </div>
            </>
        );
    };

    const renderTransmissibilities = (allParams: ChartOptionInfo[]) => {
        return (
            <>
                {renderGroup([new RadioGroupOption('transmissibility_all', t(dict.common.dataBy.allBest))])}
                {renderGroup([
                    new RadioGroupOption(modeName('transmissibility', currentPlast.id), t(dict.common.dataBy.plasts))
                ])}

                <>
                    <div className={cls([css.results__param, css.results__param_offset])}>
                        <SelectPlastSimple
                            selected={currentPlast.id}
                            dictionary={map(x => new KeyValue(x.id, x.name), props.plasts)}
                            disabled={props.currentId === 'transmissibility_all'}
                            onChange={x => {
                                props.onClick(modeName('transmissibility', x));
                                setPlastById(x);
                            }}
                        />
                    </div>
                    <div className={cls([css.results__param, css.results__param_offset])}>
                        {props.currentId !== 'transmissibility_all'
                            ? renderTransmissibilitiesForPlast(
                                  currentPlast,
                                  R.filter(x => x.plastId === currentPlast.id, allParams)
                              )
                            : null}
                    </div>
                </>
            </>
        );
    };

    const renderTransmissibilitiesForPlast = (plast: PlastInfo, info: ChartOptionInfo[]) => {
        return (
            <div key={plast.id}>
                {renderGroup([
                    new RadioGroupOption(modeName('transmissibility', plast.id), t(dict.common.dataBy.allBest))
                ])}
                {renderGroup(R.map(x => new RadioGroupOption(x.id, x.title), info))}
            </div>
        );
    };

    const renderFBL = (allParams: ChartOptionInfo[]) => {
        return (
            <>
                {renderGroup([new RadioGroupOption('fbl_all', t(dict.common.dataBy.allBest))])}
                {renderGroup([new RadioGroupOption(modeName('fbl', currentPlast.id), t(dict.common.dataBy.plasts))])}

                <div className={cls([css.results__param, css.results__param_offset])}>
                    <SelectPlastSimple
                        selected={currentPlast.id}
                        dictionary={map(x => new KeyValue(x.id, x.name), props.plasts)}
                        disabled={props.currentId === 'fbl_all'}
                        onChange={x => {
                            props.onClick(modeName('fbl', x));
                            setPlastById(x);
                        }}
                    />
                </div>
                <div className={cls([css.results__param, css.results__param_offset])}>
                    {props.currentId !== 'fbl_all'
                        ? renderFBLForPlast(
                              currentPlast,
                              R.filter(x => x.plastId === currentPlast.id, allParams)
                          )
                        : null}
                </div>
            </>
        );
    };

    const renderFBLForPlast = (plast: PlastInfo, info: ChartOptionInfo[]) => {
        return (
            <div key={plast.id}>
                {renderGroup([new RadioGroupOption(modeName('fbl', plast.id), t(dict.common.dataBy.allBest))])}
                {renderGroup(R.map(x => new RadioGroupOption(x.id, x.title), info))}
            </div>
        );
    };

    const renderFrontTracking = () => {
        if (isNullOrEmpty(props.saturationNeighbors)) {
            return null;
        }

        const saturationNeighbors = filter(x => x.plastId === currentPlast.id, props.saturationNeighbors);

        const frontTrackingParams = R.pipe(
            R.map((x: NeighborINSIM) => makeFrontTrackingOptionInfo(x, getNeighborName(x.wellId, props.neighborInfos))),
            R.flatten
        )(saturationNeighbors);

        const minLParams = R.pipe(
            R.map((x: NeighborINSIM) =>
                makeFrontTrackingMinLOptionInfo(x, getNeighborName(x.wellId, props.neighborInfos))
            ),
            R.flatten
        )(saturationNeighbors);

        return (
            <>
                <div className={css.results__paramGroup}>{t(dict.common.params.saturation)}:</div>
                <div className={cls([css.results__param])}>
                    <SelectPlastSimple
                        selected={currentPlast.id}
                        dictionary={map(x => new KeyValue(x.id, x.name), props.plasts)}
                        onChange={x => {
                            const params = R.pipe(
                                R.map((x: NeighborINSIM) =>
                                    makeFrontTrackingOptionInfo(x, getNeighborName(x.wellId, props.neighborInfos))
                                ),
                                R.flatten
                            )(filter(it => it.plastId === x, props.saturationNeighbors));

                            props.onClick(head(params)?.id);
                            setPlastById(x);
                        }}
                    />
                </div>
                <div className={cls([css.results__param])}>
                    <div className={css.results__paramName}>{t(dict.proxy.frontSaturation)}:</div>
                    {renderFrontTrackingForPlast(currentPlast, frontTrackingParams)}
                </div>
                <div className={cls([css.results__param])}>
                    <div className={css.results__paramName}>{t(dict.proxy.s)}:</div>
                    {renderFrontTrackingForPlast(currentPlast, minLParams)}
                </div>
            </>
        );
    };

    const renderFrontTrackingForPlast = (plast: PlastInfo, info: ChartOptionInfo[]) => {
        return <div key={plast.id}>{renderGroup(R.map(x => new RadioGroupOption(x.id, x.title), info))}</div>;
    };

    const renderCommonGroup = () => {
        return (
            <>
                {renderGroup([
                    new RadioGroupOption(modeName('common'), i18n.t(dict.common.dataBy.object)),
                    new RadioGroupOption(modeName('common', currentPlast.id), i18n.t(dict.common.dataBy.plasts))
                ])}
                <div className={cls([css.results__param, css.results__param_offset])}>
                    <SelectPlastSimple
                        selected={currentPlast.id}
                        dictionary={map(x => new KeyValue(x.id, x.name), props.plasts)}
                        disabled={props.currentId === modeName('common')}
                        onChange={x => {
                            props.onClick(`common-${x}`);
                            setPlastById(x);
                        }}
                    />
                </div>
            </>
        );
    };

    const renderGroup = (options: RadioGroupOption[], clsName?: string) => {
        return (
            <RadioGroup
                className={cls(css.results__param, clsName)}
                name='result-params'
                onChange={props.onClick}
                options={options}
                value={props.currentId}
            />
        );
    };

    const renderReserveDevelopmentGroup = (): JSX.Element => {
        return (
            <>
                <div className={css.results__paramGroup}>{i18n.t(dict.calculation.reserveDevelopment)}:</div>
                {renderGroup([
                    new RadioGroupOption(
                        modeName(GraphViewParam.ReserveDevelopment),
                        t(dict.common.dataBy.overAllPlasts)
                    ),
                    new RadioGroupOption(
                        bestByPlastId(GraphViewParam.ReserveDevelopment),
                        t(dict.common.dataBy.bestByPlasts)
                    ),
                    new RadioGroupOption(byPlastId(GraphViewParam.ReserveDevelopment), t(dict.common.dataBy.plasts))
                ])}
                {renderByPlastSelector(GraphViewParam.ReserveDevelopment)}
            </>
        );
    };

    return cond([
        [
            x => equals(GraphViewParam.Common, x),
            always(
                <>
                    <div className={css.results__paramGroup}>{t(dict.proxy.baseParams)}:</div>
                    {renderCommonGroup()}
                </>
            )
        ],
        [x => equals(GraphViewParam.Saturation, x), always(renderFrontTracking())],
        [
            x => equals(GraphViewParam.Watercut, x),
            always(renderInsimParamGroup('watercut', i18n.t(dict.common.params.watercutVolume)))
        ],
        [
            x => equals(GraphViewParam.Pressure, x),
            always(renderInsimParamGroup('pressure', i18n.t(dict.common.params.pressureRes)))
        ],
        [
            x => equals(GraphViewParam.Liquid, x),
            always(renderInsimParamGroup('liqrate', i18n.t(dict.common.params.liqRate)))
        ],
        [
            x => equals(GraphViewParam.Oilrate, x),
            always(renderInsimParamGroup('oilrate', i18n.t(dict.common.params.oilRate)))
        ],
        [
            x => equals(GraphViewParam.PressureBottomHole, x),
            always(renderInsimParamGroup('pressureBottomHole', i18n.t(dict.common.params.pressureZab)))
        ],
        [
            x => equals(GraphViewParam.Injection, x),
            always(renderInsimParamGroup('injection', i18n.t(dict.common.params.injectionRate)))
        ],
        [
            x => equals(GraphViewParam.SkinFactor, x),
            always(renderInsimParamGroup('skinfactor', i18n.t(dict.common.params.skinFactor)))
        ],
        [
            x => equals(GraphViewParam.Transmissibility, x),
            always(
                <>
                    <div className={css.results__paramGroup}>{i18n.t(dict.common.params.transmissibility)}:</div>
                    {renderTransmissibilities(
                        R.map(
                            x => makeTransmissibilityOptionInfo(x, getNeighborName(x.wellId, props.neighborInfos)),
                            props.neighbors
                        )
                    )}
                </>
            )
        ],
        [
            x => equals(GraphViewParam.Fbl, x),
            always(
                <>
                    <div className={css.results__paramGroup}>f(S):</div>
                    {renderFBL(
                        R.map(
                            x => makeFBLOptionInfo(x, getNeighborName(x.wellId, props.neighborInfos)),
                            props.neighbors
                        )
                    )}
                </>
            )
        ],
        [x => equals(GraphViewParam.ReserveDevelopment, x), always(renderReserveDevelopmentGroup())],
        [T, always(null)]
    ])(viewType);
};

export interface ChartOptionInfo {
    id: string;
    title: string;
    plastId?: number;
}

export const isCurrent = (paramId: unknown, currentId: unknown): boolean => currentId === paramId;

// TODO: проверить, вероятно, obsolete
export const renderOption = (
    p: ChartOptionInfo,
    currentParamId: string,
    onClick: (x: string) => void
): React.ReactNode => (
    <div key={p.id} className={css.results__param}>
        <span className={css.results__paramName}>{p.title}</span>
        <input
            className='results__param-radio'
            type='radio'
            checked={currentParamId === p.id}
            name='result-params'
            value={p.id}
            onChange={() => onClick(p.id)}
        />
    </div>
);

const makeTransmissibilityOptionInfo = (x: NeighborINSIM, neighborName: string): ChartOptionInfo => ({
    id: modeName('transmissibility', x.plastId, x.wellId),
    title: makeTransmissibilityTitle(x, neighborName),
    plastId: x.plastId
});

const makeFBLOptionInfo = (x: NeighborINSIM, neighborName: string): ChartOptionInfo => ({
    id: modeName('fbl', x.plastId, x.wellId),
    title: makeTransmissibilityTitle(x, neighborName),
    plastId: x.plastId
});

const makeFrontTrackingOptionInfo = (x: NeighborINSIM, neighborName: string): ChartOptionInfo[] => [
    {
        id: modeName('fronttracking', x.plastId, x.wellId),
        title: makeSaturationTitle(x, neighborName),
        plastId: x.plastId
    }
];

const makeFrontTrackingMinLOptionInfo = (x: NeighborINSIM, neighborName: string): ChartOptionInfo[] => [
    {
        id: modeName('minl', x.plastId, x.wellId),
        title: makeMinLTitle(x, neighborName),
        plastId: x.plastId
    }
];

const makeTransmissibilityTitle = (neighbor: NeighborINSIM, neighborName: string): string => {
    switch (neighbor.type) {
        case NeighborTypeEnum.Well:
            return `${neighborName}`;
        case NeighborTypeEnum.Underwater:
            return i18n.t(dict.common.waterFrom.bottom);
        case NeighborTypeEnum.Sector1:
            return i18n.t(dict.common.waterFrom.contour1);
        case NeighborTypeEnum.Sector2:
            return i18n.t(dict.common.waterFrom.contour2);
        case NeighborTypeEnum.Sector3:
            return i18n.t(dict.common.waterFrom.contour3);
        case NeighborTypeEnum.Sector4:
            return i18n.t(dict.common.waterFrom.contour4);
        case NeighborTypeEnum.Sector5:
            return i18n.t(dict.common.waterFrom.contour5);
        case NeighborTypeEnum.Sector6:
            return i18n.t(dict.common.waterFrom.contour6);
    }
};

const makeSaturationTitle = (neighbor: NeighborINSIM, neighborName: string): string =>
    `${makeTransmissibilityTitle(neighbor, neighborName)}`;

const makeMinLTitle = (neighbor: NeighborINSIM, neighborName: string): string =>
    `${makeTransmissibilityTitle(neighbor, neighborName)}`;

const getNeighborName = (neighborId: number, models: NeighborModel[]) =>
    findOrDefault(
        x => x.wellId === neighborId,
        x => x.name,
        `[${neighborId}]`,
        models
    );
