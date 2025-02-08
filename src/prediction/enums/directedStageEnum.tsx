import React from 'react';

import i18n from 'i18next';
import { always, cond, equals, T } from 'ramda';

import {
    AdaptationIcon,
    DataIcon,
    NetPredictionIcon,
    SubScenarioIcon
} from '../../common/components/customIcon/stages';

import mainDict from '../../common/helpers/i18n/dictionary/main.json';

export enum DirectedStageEnum {
    Preparation,
    CreateModel,
    WellGrid,
    Calculation
}

export const getLabel = (type: DirectedStageEnum): string =>
    cond([
        [equals(DirectedStageEnum.Preparation), always(i18n.t(mainDict.proxy.preparingForCalculation))],
        [equals(DirectedStageEnum.CreateModel), always(i18n.t(mainDict.proxy.selectionSubscenario))],
        [equals(DirectedStageEnum.WellGrid), always(i18n.t(mainDict.proxy.selectionWellTypes))],
        [equals(DirectedStageEnum.Calculation), always(i18n.t(mainDict.calculation.title))],
        [T, always('')]
    ])(type);

export const getButtonIcon = (type: DirectedStageEnum): React.ReactElement =>
    cond([
        [equals(DirectedStageEnum.Preparation), always(<DataIcon />)],
        [equals(DirectedStageEnum.CreateModel), always(<SubScenarioIcon />)],
        [equals(DirectedStageEnum.WellGrid), always(<NetPredictionIcon />)],
        [equals(DirectedStageEnum.Calculation), always(<AdaptationIcon />)],
        [T, always(null)]
    ])(type);
