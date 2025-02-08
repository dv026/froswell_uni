import { TabletWrapper } from 'common/components/tabletWrapper';
import { selectedWellsState } from 'commonEfficiency/store/selectedWells';
import { tabletDisplayModeState } from 'input/store/tablet/tabletDisplayModeState';
import { currentSpot } from 'input/store/well';
import { tabletCanvasSize, tabletData, tabletSettingsState } from 'inputEfficiency/store/tablet';
import { useRecoilState, useRecoilValue } from 'recoil';

export const ModuleTabletWrapper = () => {
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
