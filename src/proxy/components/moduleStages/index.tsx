import React from 'react';

import { RouteEnum } from 'common/enums/routeEnum';
import { currentSpot } from 'proxy/store/well';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';

import { CalculationModeEnum } from '../../../calculation/enums/calculationModeEnum';
import { calculationModeState } from '../../../calculation/store/calculationMode';
import { DirectedStages } from '../../../common/components/directedStages';
import * as router from '../../../common/helpers/routers/router';
import { DirectedStageEnum, getButtonIcon, getLabel } from '../../enums/directedStageEnum';
import { currentStep } from '../../store/currentStep';

const stages = [
    DirectedStageEnum.Preparation,
    DirectedStageEnum.CreateModel,
    DirectedStageEnum.WellGrid,
    DirectedStageEnum.WellGroup,
    DirectedStageEnum.Permeability,
    DirectedStageEnum.Calculation
];

const improvementStages = [
    DirectedStageEnum.Preparation,
    DirectedStageEnum.EditModel,
    DirectedStageEnum.WellGroup,
    DirectedStageEnum.Calculation
];

export const ModuleStages: React.FC = () => {
    const calculationMode = useRecoilValue(calculationModeState);
    const well = useRecoilValue(currentSpot);
    const navigate = useNavigate();
    const [step, setStep] = useRecoilState(currentStep);

    return (
        <DirectedStages
            stages={calculationMode === CalculationModeEnum.Improvement ? improvementStages : stages}
            current={step}
            onClick={s => {
                // TODO: временное решение. Проблема заключается в том, что для этапа Calculation необходима отдельная
                //      страница со специфичными параметрами.
                if (s !== DirectedStageEnum.Calculation) {
                    navigate(router.to(RouteEnum.ProxyPreparation, well));
                }

                setStep(s as DirectedStageEnum);
            }}
            getLabel={getLabel}
            getButtonIcon={getButtonIcon}
        />
    );
};
