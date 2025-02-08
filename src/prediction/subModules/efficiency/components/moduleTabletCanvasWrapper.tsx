import { tabletDisplayModeState } from 'calculation/store/tabletDisplayMode';
import { TabletWrapper } from 'common/components/tabletWrapper';
import { selectedWellsState } from 'commonEfficiency/store/selectedWells';
import { currentSpot } from 'prediction/store/well';
import { useRecoilState, useRecoilValue } from 'recoil';

import { tabletCanvasSize, tabletData, tabletSettingsState } from '../store/tablet';

export const ModuleTabletCanvasWrapper = () => {
    const model = useRecoilValue(tabletData);
    const well = useRecoilValue(currentSpot);
    const selectedWells = useRecoilValue(selectedWellsState);
    const displayMode = useRecoilValue(tabletDisplayModeState);
    const canvasSize = useRecoilValue(tabletCanvasSize);

    const [modelSettings, setModelSettings] = useRecoilState(tabletSettingsState);

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
