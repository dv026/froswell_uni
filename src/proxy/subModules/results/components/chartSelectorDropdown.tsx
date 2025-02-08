import React, { FC } from 'react';

import { FormLabel } from '@chakra-ui/react';
import i18n from 'i18next';
import { always, cond, equals, isNil, map, T } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { Dropdown, DropdownOption } from '../../../../common/components/dropdown/dropdown';
import { NeighborINSIM } from '../../../entities/insim/well';
import { NeighborModel } from '../../../entities/neighborModel';
import { PlastInfo } from '../../../entities/report/plastInfo';
import { GraphViewParam } from '../enums/graphViewParam';
import { modeName } from '../helpers/modeNameManager';
import { viewTypeSelector } from '../store/viewType';
import { сurrentParamIdState } from '../store/сurrentParamId';

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

export const ChartSelectorDropdown: FC<ChartSelectorProps> = (props: ChartSelectorProps) => {
    const { t } = useTranslation();

    const сurrentParamId = useRecoilValue(сurrentParamIdState);
    const viewType = useRecoilValue(viewTypeSelector);

    const renderInsimParamGroup = (paramName: string) => {
        return [
            new DropdownOption(overAllPlastsId(paramName), t(dict.common.dataBy.overAllPlasts)),
            new DropdownOption(bestByPlastId(paramName), t(dict.common.dataBy.bestByPlasts)),
            ...map(it => new DropdownOption(modeName(paramName, it.id), it.name), props.plasts ?? [])
        ];
    };

    const renderCommonGroup = () => {
        return [
            new DropdownOption(modeName('common'), i18n.t(dict.common.dataBy.object)),
            ...map(it => new DropdownOption(`common-${it.id}`, it.name), props.plasts ?? [])
        ];
    };

    const renderReserveDevelopmentGroup = () => {
        return [
            new DropdownOption(modeName(GraphViewParam.ReserveDevelopment), t(dict.common.dataBy.overAllPlasts)),
            new DropdownOption(bestByPlastId(GraphViewParam.ReserveDevelopment), t(dict.common.dataBy.bestByPlasts)),
            ...map(
                it => new DropdownOption(modeName(GraphViewParam.ReserveDevelopment, it.id), it.name),
                props.plasts ?? []
            )
        ];
    };

    const renderRelativePermeabilityGroup = () => {
        return [
            ...map(
                it => new DropdownOption(modeName(GraphViewParam.RelativePermeability, it.id), it.name),
                props.plasts ?? []
            )
        ];
    };

    const renderAccumOilPlanFact = () => {
        return [
            ...map(
                it => new DropdownOption(modeName(GraphViewParam.AccumOilPlanFact, it.id), it.name),
                props.plasts ?? []
            )
        ];
    };

    const renderLiquidBalance = () => {
        return [
            ...map(it => new DropdownOption(modeName(GraphViewParam.LiquidBalance, it.id), it.name), props.plasts ?? [])
        ];
    };

    const renderWaterRateSourceGroup = () => {
        return [
            new DropdownOption(modeName(GraphViewParam.WaterRateSource), i18n.t(dict.common.dataBy.object)),
            ...map(
                it => new DropdownOption(modeName(GraphViewParam.WaterRateSource, it.id), it.name),
                props.plasts ?? []
            )
        ];
    };

    const renderLiqRateSourceGroup = () => {
        return [
            new DropdownOption(modeName(GraphViewParam.LiqRateSource), i18n.t(dict.common.dataBy.object)),
            ...map(it => new DropdownOption(modeName(GraphViewParam.LiqRateSource, it.id), it.name), props.plasts ?? [])
        ];
    };

    const opts = cond([
        [x => equals(GraphViewParam.Common, x), always(renderCommonGroup())],
        [x => equals(GraphViewParam.Watercut, x), always(renderInsimParamGroup('watercut'))],
        [x => equals(GraphViewParam.Pressure, x), always(renderInsimParamGroup('pressure'))],
        [x => equals(GraphViewParam.Liquid, x), always(renderInsimParamGroup('liqrate'))],
        [x => equals(GraphViewParam.Oilrate, x), always(renderInsimParamGroup('oilrate'))],
        [x => equals(GraphViewParam.PressureBottomHole, x), always(renderInsimParamGroup('pressureBottomHole'))],
        [x => equals(GraphViewParam.Injection, x), always(renderInsimParamGroup('injection'))],
        [x => equals(GraphViewParam.SkinFactor, x), always(renderInsimParamGroup('skinfactor'))],
        [x => equals(GraphViewParam.ReserveDevelopment, x), always(renderReserveDevelopmentGroup())],
        [x => equals(GraphViewParam.RelativePermeability, x), always(renderRelativePermeabilityGroup())],
        [x => equals(GraphViewParam.WaterRateSource, x), always(renderWaterRateSourceGroup())],
        [x => equals(GraphViewParam.LiqRateSource, x), always(renderLiqRateSourceGroup())],
        [x => equals(GraphViewParam.AccumOilPlanFact, x), always(renderAccumOilPlanFact())],
        [x => equals(GraphViewParam.LiquidBalance, x), always(renderLiquidBalance())],
        [T, always(null)]
    ])(viewType);

    if (isNil(opts)) {
        return null;
    }

    return (
        <>
            <FormLabel>{t(dict.common.mode)}:</FormLabel>
            <Dropdown onChange={e => props.onClick(e.target.value)} options={opts} value={сurrentParamId} />
        </>
    );
};
