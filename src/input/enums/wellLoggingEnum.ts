import i18n from 'i18next';
import { always, cond, equals, T } from 'ramda';

import mainDict from '../../common/helpers/i18n/dictionary/main.json';

export enum WellLoggingEnum {
    NEUT = 1,
    GR,
    SP,
    GZ3,
    LLD,
    ILD,
    CALI,
    SONIC,
    RHOB
}

export const getLabel = (param: WellLoggingEnum): string =>
    cond([
        [equals(WellLoggingEnum.NEUT), always(i18n.t(mainDict.tablet.logging.neut))],
        [equals(WellLoggingEnum.GR), always(i18n.t(mainDict.tablet.logging.gr))],
        [equals(WellLoggingEnum.SP), always(i18n.t(mainDict.tablet.logging.sp))],
        [equals(WellLoggingEnum.GZ3), always(i18n.t(mainDict.tablet.logging.gz3))],
        [equals(WellLoggingEnum.LLD), always(i18n.t(mainDict.tablet.logging.lld))],
        [equals(WellLoggingEnum.ILD), always(i18n.t(mainDict.tablet.logging.ild))],
        [equals(WellLoggingEnum.CALI), always(i18n.t(mainDict.tablet.logging.cali))],
        [equals(WellLoggingEnum.SONIC), always(i18n.t(mainDict.tablet.logging.sonic))],
        [equals(WellLoggingEnum.RHOB), always(i18n.t(mainDict.tablet.logging.rhob))],
        [T, always('')]
    ])(param);

export const getBriefLabel = (param: WellLoggingEnum): string =>
    cond([
        [equals(WellLoggingEnum.NEUT), always(i18n.t(mainDict.tablet.loggingBrief.neut))],
        [equals(WellLoggingEnum.GR), always(i18n.t(mainDict.tablet.loggingBrief.gr))],
        [equals(WellLoggingEnum.SP), always(i18n.t(mainDict.tablet.loggingBrief.sp))],
        [equals(WellLoggingEnum.GZ3), always(i18n.t(mainDict.tablet.loggingBrief.gz3))],
        [equals(WellLoggingEnum.LLD), always(i18n.t(mainDict.tablet.loggingBrief.lld))],
        [equals(WellLoggingEnum.ILD), always(i18n.t(mainDict.tablet.loggingBrief.ild))],
        [equals(WellLoggingEnum.CALI), always(i18n.t(mainDict.tablet.loggingBrief.cali))],
        [equals(WellLoggingEnum.SONIC), always(i18n.t(mainDict.tablet.loggingBrief.sonic))],
        [equals(WellLoggingEnum.RHOB), always(i18n.t(mainDict.tablet.loggingBrief.rhob))],
        [T, always('')]
    ])(param);
