import { CanvasSize } from 'common/entities/canvas/canvasSize';
import { getCanvasSize } from 'common/entities/tabletCanvas/helpers/canvasSize';
import { tabletScaleState } from 'common/store/tabletScale';
import { filter, last, map, pick, pipe, propEq, sortBy, takeLast, uniq, values, zipObj } from 'ramda';
import { atom, selector } from 'recoil';

import { KeyValue } from '../../../../common/entities/keyValue';
import { isValidDate } from '../../../../common/helpers/date';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { TabletDataModel } from '../../../../input/entities/tabletDataModel';
import { TabletPerforation, TabletResearchInflowProfile } from '../../../../input/entities/tabletModel';
import { TabletSettingsModel } from '../../../../input/entities/tabletSettingsModel';
import { getTabletData } from '../../../../proxy/subModules/results/gateways/gateway';
import { currentSpot } from '../../../store/well';
import { selectedWellsState } from './selectedWells';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convert = (x: any): KeyValue => new KeyValue(x.id, x.name);

export const tabletData = selector<TabletDataModel>({
    key: 'optimization__tabletData',
    get: async ({ get }) => {
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);

        let currentWells = isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells);

        const { data } = await getTabletData(well.prodObjId, well.scenarioId, currentWells);

        let model = new TabletDataModel(data);

        return model;
    }
});

export const defaultTabletSettings = selector<TabletSettingsModel>({
    key: 'optimization__defaultTabletSettings',
    get: async ({ get }) => {
        const model = get(tabletData);
        const scale = get(tabletScaleState);
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);

        const tabletSettings = new TabletSettingsModel(model, well, selectedWells, scale);

        return tabletSettings;
    }
});

export const tabletSettingsState = atom<TabletSettingsModel>({
    key: 'optimization__tabletSettingsState',
    default: defaultTabletSettings
});

export const tabletCanvasSize = selector<CanvasSize>({
    key: 'optimization__tabletCanvasSize',
    get: async ({ get }) => {
        const model = get(tabletData);
        const setting = get(tabletSettingsState);

        return getCanvasSize(model, setting.scale, setting.hiddenColumns);
    }
});
