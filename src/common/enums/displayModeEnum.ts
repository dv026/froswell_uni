import i18n from 'i18next';
import { always, cond, equals, T } from 'ramda';

import dict from '../helpers/i18n/dictionary/main.json';

export enum DisplayModeEnum {
    Chart = 1,
    Map = 2,
    Tablet = 3,
    Heatmap = 4,
    Report = 5,
    Gtm = 8,
    Table = 9,
    TabletNew = 10,
    TabletPlusTable = 11
}

export const getLabel = (mode: DisplayModeEnum): string =>
    cond([
        [equals(DisplayModeEnum.Chart), always(i18n.t(dict.common.dynamics))],
        [equals(DisplayModeEnum.Map), always(i18n.t(dict.common.map))],
        [equals(DisplayModeEnum.Tablet), always(i18n.t(dict.common.tablet))],
        [equals(DisplayModeEnum.TabletNew), always(i18n.t(dict.common.tablet))],
        [equals(DisplayModeEnum.Heatmap), always(i18n.t(dict.common.heatmap))],
        [equals(DisplayModeEnum.Report), always(i18n.t(dict.common.report.title))],
        //[equals(DisplayModeEnum.Standart), always(i18n.t(dict.common.standartGrade))],
        //[equals(DisplayModeEnum.Insim), always(i18n.t(dict.common.insimGrade))],
        [equals(DisplayModeEnum.Gtm), always(i18n.t(dict.common.agt))],
        [equals(DisplayModeEnum.Table), always(i18n.t(dict.proxy.table))],
        [equals(DisplayModeEnum.TabletPlusTable), always(`${i18n.t(dict.common.tablet)}+${i18n.t(dict.proxy.table)}`)],
        [T, always('')]
    ])(mode);
