import React from 'react';

import i18n from 'i18next';
import { always, cond, equals, T } from 'ramda';

import {
    AdaptationIcon,
    CreateIcon,
    DataIcon,
    NetPredictionIcon,
    NetOptimizationIcon,
    NetRestrictionIcon,
    SubScenarioIcon
} from '../../common/components/customIcon/stages';

import mainDict from '../../common/helpers/i18n/dictionary/main.json';

export enum DirectedStageEnum {
    Preparation,
    CreateModel,
    WellGrid,
    WellGroup,
    Limits,
    Tagrets,
    Calculation
}

export const getLabel = (type: DirectedStageEnum): string =>
    cond([
        [equals(DirectedStageEnum.Preparation), always(i18n.t(mainDict.proxy.preparingForCalculation))],
        [equals(DirectedStageEnum.CreateModel), always(i18n.t(mainDict.proxy.createModel))],
        [equals(DirectedStageEnum.WellGrid), always(i18n.t(mainDict.proxy.selectionWellTypes))],
        [equals(DirectedStageEnum.WellGroup), always(i18n.t(mainDict.proxy.selectionWellGroups))],
        [equals(DirectedStageEnum.Limits), always(i18n.t(mainDict.proxy.wellSetup))],
        [equals(DirectedStageEnum.Tagrets), always(i18n.t(mainDict.proxy.targetOptions))],
        [equals(DirectedStageEnum.Calculation), always(i18n.t(mainDict.calculation.title))],
        [T, always('')]
    ])(type);

export const getButtonIcon = (type: DirectedStageEnum): React.ReactElement =>
    cond([
        [equals(DirectedStageEnum.Preparation), always(<DataIcon />)],
        [equals(DirectedStageEnum.CreateModel), always(<SubScenarioIcon />)],
        [equals(DirectedStageEnum.WellGrid), always(<NetPredictionIcon />)],
        [equals(DirectedStageEnum.WellGroup), always(<CreateIcon />)],
        [equals(DirectedStageEnum.Limits), always(<NetRestrictionIcon />)],
        [equals(DirectedStageEnum.Tagrets), always(<NetOptimizationIcon />)],
        [equals(DirectedStageEnum.Calculation), always(<AdaptationIcon />)],
        [T, always(null)]
    ])(type);
