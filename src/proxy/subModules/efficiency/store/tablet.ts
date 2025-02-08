import { CanvasSize } from 'common/entities/canvas/canvasSize';
import { KeyValue } from 'common/entities/keyValue';
import { getCanvasSize } from 'common/entities/tabletCanvas/helpers/canvasSize';
import { isValidDate } from 'common/helpers/date';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { tabletScaleState } from 'common/store/tabletScale';
import { TabletDataModel, TabletEfficiencyModel } from 'input/entities/tabletDataModel';
import { TabletPerforation, TabletResearchInflowProfile } from 'input/entities/tabletModel';
import { TabletSettingsModel } from 'input/entities/tabletSettingsModel';
import { currentSpot } from 'proxy/store/well';
import { getTabletData } from 'proxy/subModules/efficiency/gateways/gateway';
import { filter, last, map, pick, pipe, propEq, sortBy, takeLast, uniq, values, zipObj } from 'ramda';
import { atom, selector } from 'recoil';

import { evaluationTypeState } from '../../../../commonEfficiency/store/evaluationType';
import { gtmModeState } from '../../../../commonEfficiency/store/gtmMode';
import { selectedWellsState } from '../../../../commonEfficiency/store/selectedWells';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convert = (x: any): KeyValue => new KeyValue(x.id, x.name);

export const tabletData = selector<TabletDataModel>({
    key: 'proxyEfficiency__tabletData',
    get: async ({ get }) => {
        const evaluationType = get(evaluationTypeState);
        const gtmType = get(gtmModeState);
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);

        let currentWells = isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells);

        const { data } = await getTabletData(well.prodObjId, well.scenarioId, currentWells, evaluationType, gtmType);

        let model = new TabletDataModel(data);

        return model;
    }
});

export const defaultTabletSettings = selector<TabletSettingsModel>({
    key: 'proxyEfficiency__defaultTabletSettings',
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
    key: 'proxyEfficiency__tabletSettingsState',
    default: defaultTabletSettings
});

export const tabletCanvasSize = selector<CanvasSize>({
    key: 'proxyEfficiency__tabletCanvasSize',
    get: async ({ get }) => {
        const model = get(tabletData);
        const setting = get(tabletSettingsState);

        return getCanvasSize(model, setting.scale, setting.hiddenColumns);
    }
});
