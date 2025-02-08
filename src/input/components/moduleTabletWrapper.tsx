import { useEffect } from 'react';

import { TabletWrapper } from 'common/components/tabletWrapper';
import { groupByProp, isNullOrEmpty } from 'common/helpers/ramda';
import { selectedWellsState } from 'input/store/selectedWells';
import { tabletCanvasSize, tabletData, tabletSettingsState } from 'input/store/tablet/tablet';
import { tabletDisplayModeState } from 'input/store/tablet/tabletDisplayModeState';
import { currentSpot } from 'input/store/well';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

export const ModuleTabletWrapper = () => {
    const model = useRecoilValue(tabletData);
    const well = useRecoilValue(currentSpot);
    const selectedWells = useRecoilValue(selectedWellsState);
    const displayMode = useRecoilValue(tabletDisplayModeState);
    const canvasSize = useRecoilValue(tabletCanvasSize);

    const [modelSettings, setModelSettings] = useRecoilState(tabletSettingsState);

    const resetSelectedWells = useResetRecoilState(selectedWellsState);

    // todo mb current tablet version can work with only one object
    useEffect(() => {
        if (isNullOrEmpty(selectedWells)) {
            return;
        }

        const objs = groupByProp('prodObjId', selectedWells);

        if (Object.keys(objs).length > 1) {
            resetSelectedWells();
        }
    }, []);

    return (
        <TabletWrapper
            model={model}
            well={well}
            selectedWells={selectedWells}
            displayMode={displayMode}
            modelSettings={modelSettings}
            canvasSize={canvasSize}
            setModelSettings={setModelSettings}
        />
    );
};
