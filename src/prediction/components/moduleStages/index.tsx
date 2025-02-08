import React from 'react';

import { RouteEnum } from 'common/enums/routeEnum';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { DirectedStages } from '../../../common/components/directedStages';
import { DirectedStageEnum, getButtonIcon, getLabel } from '../../enums/directedStageEnum';
import { currentStepState } from '../../store/currentStep';

const stages = [
    DirectedStageEnum.Preparation,
    DirectedStageEnum.CreateModel,
    DirectedStageEnum.WellGrid,
    DirectedStageEnum.Calculation
];

export const ModuleStages: React.FC = () => {
    const [step, setStep] = useRecoilState(currentStepState);
    const navigate = useNavigate();

    return (
        <DirectedStages
            stages={stages}
            current={step}
            onClick={s => {
                // TODO: временное решение. Проблема заключается в том, что для этапа Calculation необходима отдельная
                //      страница со специфичными параметрами.
                if (s !== DirectedStageEnum.Calculation) {
                    navigate(RouteEnum.PredictionPreparation);
                }

                setStep(s as DirectedStageEnum);
            }}
            getLabel={getLabel}
            getButtonIcon={getButtonIcon}
        />
    );
};
