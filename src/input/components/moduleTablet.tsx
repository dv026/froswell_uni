import React, { FC, useEffect } from 'react';

import { WellBrief } from 'common/entities/wellBrief';
import { downloadFile } from 'common/helpers/file';
import { exportTabletData } from 'input/gateways';
import { useWellMutations } from 'input/store/wellMutations';
import { wellListState } from 'input/store/wells';
import { filter, find, map } from 'ramda';
import { useRecoilState, useRecoilValue } from 'recoil';

import { EmptyData } from '../../common/components/emptyData';
import { Legend } from '../../common/components/tabletWrapper/legend';
import { DisplayModeEnum } from '../../common/enums/displayModeEnum';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { TabletModeType } from '../enums/tabletModeType';
import { selectedWellsState } from '../store/selectedWells';
import { loggingSettingsState } from '../store/tablet/loggingSettings';
import { tabletData, tabletSettingsState } from '../store/tablet/tablet';
import { tabletDisplayModeState } from '../store/tablet/tabletDisplayModeState';
import { tabletModeTypeState } from '../store/tablet/tabletModeType';
import { currentSpot, wellNameById } from '../store/well';
import { Tablet, TabletProps } from './tablet';
import { TabletByPlasts } from './tablet/tabletByPlasts';
import { TabletByWells } from './tablet/tabletByWells';
import { TabletTableView } from './tablet/tabletTableView';

export const ModuleTablet = () => {
    const loggingSettings = useRecoilValue(loggingSettingsState);
    const model = useRecoilValue(tabletData);
    const tabletDisplayMode = useRecoilValue(tabletDisplayModeState);
    const tabletModeType = useRecoilValue(tabletModeTypeState);
    const well = useRecoilValue(currentSpot);
    const wells = useRecoilValue(wellListState);

    const [modelSettings, setModelSettings] = useRecoilState(tabletSettingsState);
    const [selectedWells, setSelectedWells] = useRecoilState(selectedWellsState);

    const wellName = useRecoilValue(wellNameById(well.id));

    const wellMutation = useWellMutations();

    // скинуть на первую скважину, если находимся в режиме всех объектов
    useEffect(() => {
        if (!well.prodObjId && well.id) {
            const selected = find(it => it.oilFieldId === well.oilFieldId && it.id === well.id, wells);
            if (selected) {
                wellMutation.set(
                    new WellBrief(selected.oilFieldId, selected.id, selected.productionObjectId, selected.charWorkId)
                );
                setSelectedWells([]);
            }
        }
    }, [setSelectedWells, well, wells, wellMutation]);

    if (!well.id && isNullOrEmpty(selectedWells)) {
        return tabletModeType === TabletModeType.Plasts ? <TabletByPlasts /> : <TabletByWells />;
    }

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
            <Legend
                selectedWells={selectedWells}
                settings={modelSettings}
                tabletData={model}
                changeSettings={setModelSettings}
            />
            <Tablet key={well.id} {...tabletProps} />
        </>
    );
};
