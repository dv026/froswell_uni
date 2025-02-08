import { selector } from 'recoil';

import { ChartViewData } from '../entities/chartBuilder';
import { currentModeSelector } from './currentMode';
import { hiddenLinesState } from './hiddenLines';
import { reportState } from './report';

export const viewDataSelector = selector<ChartViewData>({
    key: 'proxyResults__viewDataSelector',
    get: ({ get }) => {
        const currentMode = get(currentModeSelector);
        const hiddenLines = get(hiddenLinesState);
        const report = get(reportState);
        //const currentParamId = get(сurrentParamIdState);

        const chartsData = report?.insim?.adaptations ?? [];

        return currentMode.render(chartsData, report.dataType, hiddenLines, null);
    }
});
