import React, { FC } from 'react';

import { Box } from '@chakra-ui/react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { currentSubScenarioId } from '../../../../calculation/store/currentSubScenarioId';
import { round0 } from '../../../../common/helpers/math';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { WellSetupSavedModel } from '../entities/wellSetupSavedModel';
import { GroupType } from '../enums/groupType';
import { createOrUpdate } from '../gateways/gateway';
import { groupTypeState } from '../store/groupType';
import { moduleState } from '../store/moduleState';
import { wellTypeState } from '../store/wellType';
import { WellSetupUnitByOil } from './wellSetupUnitByOil';
import { WellSetupUnitByWaterCut } from './wellSetupUnitByWaterCut';

import css from './index.module.less';

export const MainContent = () => {
    const groupType = useRecoilValue(groupTypeState);
    const wellType = useRecoilValue(wellTypeState);
    const module = useRecoilValue(moduleState);

    const subScenarioId = useRecoilValue(currentSubScenarioId); // todo mb

    const wellSetups = module.setups;
    const saved = module.saved;

    const createOrUpdateAction = useRecoilCallback(
        () => async (model: WellSetupSavedModel) =>
            await createOrUpdate([
                {
                    id: model.id ?? 0,
                    subScenarioId: model.subScenarioId ?? subScenarioId,
                    wellType: model.wellType ?? wellType,
                    wells: model.wells ?? [],
                    type: model.type ?? 1,
                    minPressureZab: round0(model.minPressureZab),
                    isManual: model.isManual
                }
            ])
    );

    if (isNullOrEmpty(wellSetups)) {
        return null;
    }

    return (
        <Box className={css.limits}>
            {groupType === GroupType.WaterCut ? (
                <WellSetupUnitByWaterCut
                    key='unit1'
                    data={wellSetups}
                    saved={saved}
                    wellType={wellType}
                    groupType={groupType}
                    createOrUpdate={model => createOrUpdateAction(model)}
                />
            ) : (
                <WellSetupUnitByOil
                    key='unit2'
                    data={wellSetups}
                    saved={saved}
                    wellType={wellType}
                    groupType={groupType}
                    createOrUpdate={model => createOrUpdateAction(model)}
                />
            )}
        </Box>
    );
};
