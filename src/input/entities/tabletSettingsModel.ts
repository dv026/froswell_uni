import { CanvasSize } from 'common/entities/canvas/canvasSize';
import { getCanvasSize } from 'common/entities/tabletCanvas/helpers/canvasSize';
import { efficiencyColumns, inputColumns, proxyColumns } from 'common/entities/tabletCanvas/helpers/constants';
import { WellBrief } from 'common/entities/wellBrief';
import { TabletColumnEnum } from 'common/enums/tabletColumnEnum';
import { isValidDate } from 'common/helpers/date';
import { max } from 'common/helpers/math';
import { perforation } from 'common/helpers/parameters';
import { groupByProp, isNullOrEmpty } from 'common/helpers/ramda';
import {
    assoc,
    curry,
    filter,
    flatten,
    forEach,
    forEachObjIndexed,
    includes,
    last,
    map,
    mapObjIndexed,
    pick,
    propEq,
    reject,
    sum,
    takeLast,
    uniq,
    values,
    when,
    zipObj
} from 'ramda';

import { KeyValue } from '../../common/entities/keyValue';
import { WellLoggingEnum } from '../enums/wellLoggingEnum';
import { TabletColumn } from './tabletColumn';
import { ProxyTabletModel, TabletDataModel, TabletEfficiencyModel } from './tabletDataModel';
import { TabletDownholeHistory, TabletModel, TabletPackerHistory, TabletPerforation } from './tabletModel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convert = (x: any): KeyValue => new KeyValue(x.id, x.name);

export class TabletSettingsModel {
    public scale: number;
    public fixedHeader: boolean;
    public showDepth: boolean;
    public prodObjId: number;
    public prodObjDict: Array<KeyValue>;
    public profileMode: boolean;
    public indent: number;
    public selectedLogging: WellLoggingEnum[];
    public selectedResearch: Date[];
    public selectedPacker: number;
    public selectedDownhole: number;
    public hiddenColumns: TabletColumnEnum[];

    public constructor(model: TabletDataModel, well: WellBrief, selectedWells: WellBrief[], scale: number) {
        this.scale = scale;
        this.fixedHeader = true;
        this.showDepth = true;
        this.prodObjId = null;
        this.prodObjDict = [];
        this.profileMode = false;
        this.indent = 1000;
        this.selectedLogging = [WellLoggingEnum.NEUT, WellLoggingEnum.GR, WellLoggingEnum.LLD];
        this.selectedResearch = [];
        this.selectedPacker = null;
        this.selectedDownhole = null;
        this.hiddenColumns = [];

        let wellObj = filter(propEq('wellId', [well.id]))(model.data);

        this.prodObjDict = map(
            convert,
            uniq(
                map(
                    x => zipObj(['id', 'name'], values(pick(['productionObjectId', 'productionObjectName'], x))),
                    wellObj
                )
            )
        );
        this.prodObjId = well.prodObjId;
        this.profileMode = false;

        this.selectedResearch = isNullOrEmpty(selectedWells)
            ? takeLast(3, uniq(map(it => it.dt, model.researchInflowProfile)))
            : uniq(map(it => it.dt, model.researchInflowProfile));

        this.selectedPacker =
            !isNullOrEmpty(model.packerHistory) && isValidDate(new Date(last(model.packerHistory)?.closingDate))
                ? last(model.packerHistory).id
                : null;

        this.selectedDownhole = !isNullOrEmpty(model.downholeHistory) ? last(model.downholeHistory).id : null;
    }
}

export const getColumns = (model: TabletDataModel, hiddenColumns: TabletColumnEnum[]): Array<TabletColumn> => {
    let maxPermeability = 1000;

    let common = inputColumns;
    let proxy = proxyColumns;
    let efficiency = efficiencyColumns;

    if (!isNullOrEmpty(model.data)) {
        const permeabilities = map(it => it.permeability, model.data);

        maxPermeability = Math.round(max(permeabilities) * 1.15) || maxPermeability;

        common = alter([0, maxPermeability], 'permeability', common);
    }

    if (!isNullOrEmpty(model.perforation)) {
        const getLength = (data: TabletPerforation[]) => Object.values(groupByProp('dt', data)).length;

        const length = getLength(filter(it => !it.grpState, model.perforation));
        common = alterWidth(40 * length, 'perforation', common);

        const lengthGrp = getLength(filter(it => it.grpState, model.perforation));
        common = alterWidth(40 * lengthGrp, 'hydraulicFracturing', common);
    }

    if (isNullOrEmpty(model.packerHistory) && isNullOrEmpty(model.downholeHistory)) {
        common = reject((it: TabletColumn) => it.dataKey === 'packer', common);
    }

    if (!isNullOrEmpty(model.efficiencyData)) {
        forEachObjIndexed((group: TabletEfficiencyModel[], key: string) => {
            const columns = reject((c: TabletColumn) => !max(map(it => it[c.dataKey], group)), efficiency);

            common.push(...columns);
        }, groupByProp('operationName', model.efficiencyData ?? []));
    }

    if (!isNullOrEmpty(model.proxyData)) {
        const maxVolume = Math.round(max(map(it => it.avgVolume, model.proxyData)) * 1.15) || 1000;
        const maxTransmissibility = Math.round(max(map(it => it.avgTransmissibility, model.proxyData)) * 1.15) || 1000;

        proxy = alter([0, maxVolume], 'avgVolume', proxy);
        proxy = alter([0, maxTransmissibility], 'avgTransmissibility', proxy);

        if (!max(map(it => it.effectiveInjection, model.proxyData))) {
            proxy = reject((it: TabletColumn) => it.dataKey === 'effectiveInjection', proxy);
        }

        common.push(...proxy);
    }

    return filter(it => !includes(it.index, hiddenColumns), common);
};

export const getEfficiencyColumnWidth = (efficiencyData: TabletEfficiencyModel[]): number => {
    if (isNullOrEmpty(efficiencyData ?? [])) {
        return 0;
    }

    let width = 0;

    forEachObjIndexed(group => {
        forEach((column: TabletColumn) => {
            if (max(map(it => it[column.dataKey], group))) {
                width += column.width;
            }
        }, efficiencyColumns);
    }, groupByProp('operationName', efficiencyData));

    return width;
};

const alter = curry((range, key, items) => map(when(propEq('dataKey', key), assoc('range', range)), items));
const alterWidth = curry((width, key, items) => map(when(propEq('dataKey', key), assoc('width', width)), items));
