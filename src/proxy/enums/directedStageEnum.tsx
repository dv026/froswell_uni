import React from 'react';

import i18n from 'i18next';
import { always, cond, equals, T } from 'ramda';

import {
    AdaptationIcon,
    CreateIcon,
    DataIcon,
    NetIcon,
    PermeabilityIcon,
    SubScenarioIcon
} from '../../common/components/customIcon/stages';

import mainDict from '../../common/helpers/i18n/dictionary/main.json';

export enum DirectedStageEnum {
    Preparation,
    CreateModel,
    EditModel,
    WellGrid,
    WellGroup,
    Permeability,
    Calculation
}

export const getLabel = (type: DirectedStageEnum): string =>
    cond([
        [equals(DirectedStageEnum.Preparation), always(i18n.t(mainDict.proxy.preparingForCalculation))],
        [equals(DirectedStageEnum.CreateModel), always(i18n.t(mainDict.proxy.createModel))],
        [equals(DirectedStageEnum.EditModel), always(i18n.t(mainDict.proxy.editModel))],
        [equals(DirectedStageEnum.WellGrid), always(i18n.t(mainDict.proxy.wellGridText))],
        [equals(DirectedStageEnum.WellGroup), always(i18n.t(mainDict.proxy.selectionWellGroups))],
        [equals(DirectedStageEnum.Permeability), always(i18n.t(mainDict.proxy.RPPpermeability))],
        [equals(DirectedStageEnum.Calculation), always(i18n.t(mainDict.calculation.title))],
        [T, always('')]
    ])(type);

export const getButtonIcon = (type: DirectedStageEnum): React.ReactElement =>
    cond([
        [equals(DirectedStageEnum.Preparation), always(<DataIcon />)],
        [equals(DirectedStageEnum.CreateModel), always(<SubScenarioIcon />)],
        [equals(DirectedStageEnum.EditModel), always(<SubScenarioIcon />)],
        [equals(DirectedStageEnum.WellGrid), always(<NetIcon />)],
        [equals(DirectedStageEnum.WellGroup), always(<CreateIcon />)],
        [equals(DirectedStageEnum.Permeability), always(<PermeabilityIcon />)],
        [equals(DirectedStageEnum.Calculation), always(<AdaptationIcon />)],
        [T, always(null)]
    ])(type);
