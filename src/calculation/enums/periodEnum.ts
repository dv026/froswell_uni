import i18n from 'i18next';
import { mergeRight } from 'ramda';

import { DropdownOption } from '../../common/components/dropdown/dropdown';
import { InsimCalculationParams } from '../../proxy/entities/insimCalculationParams';
import { PeriodTypeEnum } from '../../proxy/subModules/calculation/enums/periodTypeEnum';

import mainDict from '../../common/helpers/i18n/dictionary/main.json';

export enum PeriodEnum {
    OneDay = 1,
    TwoDays = 2,
    ThreeDays = 3,
    Week = 7,
    Fifteen = 15,
    TwentyFive = 25,
    Month = 30
}

export const creationOpts = (): DropdownOption[] => [
    new DropdownOption(PeriodEnum.OneDay, i18n.t(mainDict.proxy.period.oneDay)),
    new DropdownOption(PeriodEnum.TwoDays, i18n.t(mainDict.proxy.period.twoDays)),
    new DropdownOption(PeriodEnum.ThreeDays, i18n.t(mainDict.proxy.period.threeDays)),
    new DropdownOption(PeriodEnum.Week, i18n.t(mainDict.proxy.period.week)),
    new DropdownOption(PeriodEnum.Fifteen, i18n.t(mainDict.proxy.period.fifteen)),
    new DropdownOption(PeriodEnum.TwentyFive, i18n.t(mainDict.proxy.period.twentyFive)),
    new DropdownOption(PeriodEnum.Month, i18n.t(mainDict.proxy.period.month))
];

export const toPeriodValue = (period: number, periodType: PeriodTypeEnum): PeriodEnum =>
    periodType === PeriodTypeEnum.Month ? PeriodEnum.Month : period;

export const upd = (old: InsimCalculationParams, fresh: Partial<InsimCalculationParams>): InsimCalculationParams =>
    mergeRight<InsimCalculationParams, Partial<InsimCalculationParams>>(old, fresh);

export const updPeriod = (old: InsimCalculationParams, newPeriod: number): InsimCalculationParams =>
    upd(old, {
        period: period(newPeriod),
        periodType: periodType(newPeriod)
    });

const period = (newPeriod: number) => (newPeriod === PeriodEnum.Month ? 1 : newPeriod);
const periodType = (newPeriod: number) => (newPeriod === PeriodEnum.Month ? PeriodTypeEnum.Month : PeriodTypeEnum.Day);
