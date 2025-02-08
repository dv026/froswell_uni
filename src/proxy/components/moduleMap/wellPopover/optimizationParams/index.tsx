import React, { FC } from 'react';

import { Tabs, Tab, TabList, TabPanel, TabPanels } from '@chakra-ui/react';
import { filter, find, flatten, isNil } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValueLoadable } from 'recoil';

import { isOil, isInj } from '../../../../../common/enums/wellTypeEnum';
import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { hasValue } from '../../../../../common/helpers/recoil';
import { PressureSlider } from '../../../../../prediction/subModules/wellGrid/components/pressureSlider';
import { SkinFactorSlider } from '../../../../../prediction/subModules/wellGrid/components/skinFactorSlider';
import { MapSettingModel } from '../../../../entities/proxyMap/mapSettingModel';
import { ImaginaryCharWorkHistory, WellPoint } from '../../../../entities/proxyMap/wellPoint';
import { mapSettingsState } from '../../../../store/map/mapSettings';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface OptimizationParamsProps {
    typeHistories: ImaginaryCharWorkHistory[];
    wellId: number;
    tabIndex: number;
    setTabIndex: (index: number) => void;
}

export const OptimizationParams: FC<OptimizationParamsProps> = (p: OptimizationParamsProps) => {
    const { t } = useTranslation();

    const mapSettingsLoadable = useRecoilValueLoadable(mapSettingsState);

    const mapSettings = hasValue(mapSettingsLoadable) ? mapSettingsLoadable.contents : new MapSettingModel();
    const wellId = p.wellId;

    let well: WellPoint = find(
        it => it.id === wellId,
        flatten([
            mapSettings.points,
            mapSettings.imaginaryPoints,
            mapSettings.currentFundWithImaginary,
            mapSettings.drilledPoints
        ])
    );

    let typeHistories = filter(it => it.isImaginary, p.typeHistories);

    const existOpenReal = find(it => !it.isImaginary && isNil(it.closingDate), p.typeHistories);

    if (isNullOrEmpty(typeHistories) && existOpenReal) {
        typeHistories = [existOpenReal];
    }

    // интерактивная смена характера работы
    if (well && !isNullOrEmpty(typeHistories)) {
        well = new WellPoint(
            well.id,
            well.x,
            well.y,
            well.x,
            well.y,
            well.name,
            well.plastId,
            typeHistories,
            well.isImaginary,
            well.isIntermediate,
            well.isDrilledFoundation,
            well.trajectories,
            well.plastNames
        );
    }

    if (!well || !well.type || !(isOil(well.type) || isInj(well.type))) {
        return null;
    }

    if (isNullOrEmpty(typeHistories)) {
        return null;
    }

    return (
        <Tabs isLazy={true} isManual={true} onChange={p.setTabIndex}>
            <TabList>
                <Tab>{t(dict.common.params.pressureZab)}</Tab>
                <Tab>{t(dict.common.params.skinFactor)}</Tab>
            </TabList>
            <TabPanels pt={2}>
                <TabPanel>
                    <PressureSlider well={well} />
                </TabPanel>
                <TabPanel>
                    <SkinFactorSlider well={well} />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
};
