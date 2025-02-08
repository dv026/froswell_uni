import React from 'react';

import { downloadFile } from 'common/helpers/file';
import { exportTabletData } from 'input/gateways';
import { filter, map } from 'ramda';
import { useRecoilState, useRecoilValue } from 'recoil';

import { tabletDisplayModeState } from '../../../../calculation/store/tabletDisplayMode';
import { EmptyData } from '../../../../common/components/emptyData';
import { Legend } from '../../../../common/components/tabletWrapper/legend';
import { KeyValue } from '../../../../common/entities/keyValue';
import { DisplayModeEnum } from '../../../../common/enums/displayModeEnum';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { Tablet, TabletProps } from '../../../../input/components/tablet';
import { TabletTableView } from '../../../../input/components/tablet/tabletTableView';
import { loggingSettingsState } from '../../../../input/store/tablet/loggingSettings';
import { currentSpot, wellNameById } from '../../../store/well';
import { selectedWellsState } from '../store/selectedWells';
import { tabletData, tabletSettingsState } from '../store/tablet';

export const ModuleTablet = () => {
    const loggingSettings = useRecoilValue(loggingSettingsState);
    const model = useRecoilValue(tabletData);
    const selectedWells = useRecoilValue(selectedWellsState);
    const tabletDisplayMode = useRecoilValue(tabletDisplayModeState);
    const well = useRecoilValue(currentSpot);
    const wellName = useRecoilValue(wellNameById(well.id));

    const [modelSettings, setModelSettings] = useRecoilState(tabletSettingsState);

    if (isNullOrEmpty(model.data)) {
        return <EmptyData />;
    }

    if (tabletDisplayMode === DisplayModeEnum.Table) {
        return <TabletTableView rigis={model.data} perforation={model.perforation} />;
    }

    const exportDataHandler = async () => {
        const response = await exportTabletData(
            well.prodObjId,
            isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells)
        );

        downloadFile(response);
    };

    const tabletProps: TabletProps = {
        data: model.data,
        proxyData: model.proxyData,
        fixedHeader: modelSettings.fixedHeader,
        focusOnProductionObject: modelSettings.prodObjId,
        perforation: model.perforation,
        profileMode: modelSettings.profileMode,
        scale: modelSettings.scale,
        selectedLogging: modelSettings.selectedLogging,
        selectedResearch: modelSettings.selectedResearch,
        selectedWells: selectedWells,
        showDepth: modelSettings.showDepth,
        trajectories: model.trajectories,
        well: well,
        wellName: wellName,
        researchInflowProfile: model.researchInflowProfile,
        wellLogging: model.wellLogging,
        loggingSettings: loggingSettings,
        packerHistory: filter(it => it.id === modelSettings.selectedPacker, model.packerHistory),
        downholeHistory: filter(it => it.id === modelSettings.selectedDownhole, model.downholeHistory ?? []),
        exportData: exportDataHandler
    };

    return (
        <>
            <Legend selectedWells={[]} settings={modelSettings} tabletData={model} changeSettings={setModelSettings} />
            <Tablet key={well.id} {...tabletProps} />
        </>
    );
};
