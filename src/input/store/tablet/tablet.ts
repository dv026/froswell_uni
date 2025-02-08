import { CanvasSize } from 'common/entities/canvas/canvasSize';
import { tabletScaleState } from 'common/store/tabletScale';
import { map } from 'ramda';
import { atom, selector } from 'recoil';

import { getCanvasSize } from '../../../common/entities/tabletCanvas/helpers/canvasSize';
import { isNullOrEmpty } from '../../../common/helpers/ramda';
import { TabletDataModel } from '../../entities/tabletDataModel';
import { TabletViewModelByWell } from '../../entities/tabletModel';
import { TabletSettingsModel } from '../../entities/tabletSettingsModel';
import { getTabletData } from '../../gateways';
import { selectedWellsState } from '../selectedWells';
import { currentSpot } from '../well';
import { indentState } from './indent';

export const tabletData = selector<TabletDataModel>({
    key: 'input__tabletData',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);
        const indent = get(indentState);

        let currentWells = isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells);

        const { data } = await getTabletData(well.prodObjId, currentWells, indent);

        let model = new TabletDataModel(data);

        return model;
    }
});

const defaultTabletSettings = selector<TabletSettingsModel>({
    key: 'input__defaultTabletSettings',
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
    key: 'input__tabletSettingsState',
    default: defaultTabletSettings
});

export const tabletCanvasSize = selector<CanvasSize>({
    key: 'input__tabletCanvasSize',
    get: async ({ get }) => {
        const model = get(tabletData);
        const setting = get(tabletSettingsState);

        return getCanvasSize(model, setting.scale, setting.hiddenColumns);
    }
});

export const dataByWellsSelector = selector<TabletViewModelByWell[]>({
    key: 'input__dataByWellsSelector',
    get: async ({ get }) => {
        const model = get(tabletData);

        if (isNullOrEmpty(model.dataByWells)) {
            return [];
        }

        const result = map(
            it =>
                ({
                    plastId: it.plastId,
                    wellId: it.wellId,
                    wellPlastName: `${it.wellName} ${it.plastName}`,
                    partPefroration: it.partPefroration,
                    permeability: it.permeability,
                    avgInflowProfile: it.avgInflowProfile,
                    isClosed: false
                } as TabletViewModelByWell),
            model.dataByWells
        );

        for (let i = 0; i < result.length; i++) {
            if (i + 1 < result.length) {
                result[i].isClosed = result[i].plastId !== result[i + 1].plastId;
            }
        }

        return result;
    }
});
