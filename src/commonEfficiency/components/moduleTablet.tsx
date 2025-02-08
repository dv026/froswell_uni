import React from 'react';

import { tabletDisplayModeState } from 'calculation/store/tabletDisplayMode';
import { EmptyData } from 'common/components/emptyData';
import { Legend } from 'common/components/tabletWrapper/legend';
import { DisplayModeEnum } from 'common/enums/displayModeEnum';
import { downloadFile } from 'common/helpers/file';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { Tablet, TabletProps } from 'input/components/tablet';
import { TabletTableView } from 'input/components/tablet/tabletTableView';
import { TabletDataModel } from 'input/entities/tabletDataModel';
import { TabletSettingsModel } from 'input/entities/tabletSettingsModel';
import { exportTabletData } from 'input/gateways';
import { loggingSettingsState } from 'input/store/tablet/loggingSettings';
import { currentSpot, wellNameById } from 'input/store/well';
import { filter, map } from 'ramda';
import { SetterOrUpdater, useRecoilValue } from 'recoil';

import { evaluationTypeState } from '../store/evaluationType';
import { selectedWellsState } from '../store/selectedWells';

interface ModuleTabletProps {
    model: TabletDataModel;
    modelSettings: TabletSettingsModel;
    setModelSettings: SetterOrUpdater<TabletSettingsModel>;
}

export const ModuleTablet = (props: ModuleTabletProps) => {
    const { model, modelSettings, setModelSettings } = props;

    const evaluationType = useRecoilValue(evaluationTypeState);
    const loggingSettings = useRecoilValue(loggingSettingsState);
    const selectedWells = useRecoilValue(selectedWellsState);
    const tabletDisplayMode = useRecoilValue(tabletDisplayModeState);
    const well = useRecoilValue(currentSpot);
    const wellName = useRecoilValue(wellNameById(well.id));

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
        efficiencyData: model.efficiencyData,
        efficiencyEvaluationType: evaluationType,
        fixedHeader: modelSettings.fixedHeader,
        focusOnProductionObject: modelSettings.prodObjId,
        loggingSettings: loggingSettings,
        packerHistory: filter(it => it.id === modelSettings.selectedPacker, model.packerHistory),
        downholeHistory: filter(it => it.id === modelSettings.selectedDownhole, model.downholeHistory ?? []),
        perforation: model.perforation,
        profileMode: modelSettings.profileMode,
        proxyData: model.proxyData,
        researchInflowProfile: model.researchInflowProfile,
        scale: modelSettings.scale,
        selectedLogging: modelSettings.selectedLogging,
        selectedResearch: modelSettings.selectedResearch,
        selectedWells: selectedWells,
        showDepth: modelSettings.showDepth,
        trajectories: model.trajectories,
        well: well,
        wellName: wellName,
        wellLogging: model.wellLogging,
        exportData: exportDataHandler
    };

    return (
        <>
            <Legend selectedWells={[]} settings={modelSettings} tabletData={model} changeSettings={setModelSettings} />
            <Tablet key={well.id} {...tabletProps} />
        </>
    );
};
