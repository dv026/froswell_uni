import { find, head, isNil } from 'ramda';
import { selector } from 'recoil';

import { currentSpot } from '../../../store/well';
import { ChartBuilder } from '../entities/chartBuilder';
import { createModes } from '../helpers/modeBuilder';
import { modeMapTypeState } from './modeMapType';
import { reportState } from './report';
import { showRepairsState } from './showRepairs';
import { сurrentParamIdState } from './сurrentParamId';

export const renderModesSelector = selector<ChartBuilder[]>({
    key: 'proxyResults__renderModesSelector',
    get: async ({ get }) => {
        const modeMapType = get(modeMapTypeState);
        const report = get(reportState);
        const showPepairs = get(showRepairsState);
        const well = get(currentSpot);

        const wellName = well.id ? well.id.toString() : null; // todo mb

        return createModes(report, report.plasts, wellName, showPepairs, modeMapType);
    }
});

export const currentModeSelector = selector<ChartBuilder>({
    key: 'proxyResults__currentModeSelector',
    get: async ({ get }) => {
        const newModes = get(renderModesSelector);
        const currentParamId = get(сurrentParamIdState);

        const item = find(x => x.name() === currentParamId, newModes);

        return isNil(item) && !currentParamId.includes('fronttracking') ? head(newModes) : item; // todo mb
    }
});
