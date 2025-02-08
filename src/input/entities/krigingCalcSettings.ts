import * as R from 'ramda';

import { DefaultDates } from '../../common/components/defaultDates';
import { BatchStatus } from '../../common/entities/batchStatus';
import { ParamDate } from '../../common/entities/paramDate';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { VarioModelEnum } from '../enums/varioModelEnum';

export class KrigingCalcSettingsModel {
    public allowNegative: boolean;
    public batchStatus: BatchStatus;
    public byObject: number;
    public cleanAllData: boolean;
    public defaultDates: DefaultDates;
    public endDate: Date;
    public krigingCalcStep: number;
    public oilFieldId: number;
    public onlyInnerActiveContour: boolean;
    public params: Array<string>;
    public plastId: number;
    public preliminaryCalcStep: number;
    public productionObjectId: number;
    public startDate: Date;
    public varioDegree: number;
    public varioModel: VarioModelEnum;
    public varioRadius: number;
    public zoneNonCollector: boolean;
    public zonePureOil: boolean;
    public zonePureWater: boolean;
    public zoneWaterOil: boolean;

    public scenarioId: number;
    public subScenarioId: number;
    public optimization: boolean;

    public values: KrigingDateValues;

    public constructor() {
        this.defaultDates = null;
        this.endDate = new Date(2018, 5, 1);
        this.krigingCalcStep = 50;
        this.onlyInnerActiveContour = true;
        this.params = [];
        this.preliminaryCalcStep = 2000;
        this.startDate = new Date(2018, 5, 1);
        this.varioDegree = 1.3;
        this.varioModel = VarioModelEnum.Power;
        this.varioRadius = 4000;
        this.zoneNonCollector = true;
        this.zonePureOil = true;
        this.zonePureWater = true;
        this.zoneWaterOil = true;
        this.cleanAllData = true;

        this.values = {
            avgPressureZab: [],
            oilSaturation: [],
            pressureRes: []
        };
    }
}

export interface KrigingDateValues {
    avgPressureZab: ParamDate[];
    oilSaturation: ParamDate[];
    pressureRes: ParamDate[];
}

export const defaultMaxDate = (values: ParamDate[]): Date =>
    isNullOrEmpty(values) ? null : R.last(R.sortBy(x => x.date, values)).date;
export const defaultMinDate = (values: ParamDate[]): Date =>
    isNullOrEmpty(values) ? null : R.head(R.sortBy(x => x.date, values)).date;
