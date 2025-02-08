import i18n from 'i18next';
import { always, cond, equals, T } from 'ramda';

import mainDict from '../../common/helpers/i18n/dictionary/main.json';

export enum DownholeType {
    CurrentFace = 1, // Текущий забой (ТЗ)
    ExplosionPacker = 2, // Взрывпакер (ВП)
    PlugPacker = 3 // Пакер-пробка (ПП)
}

export const getDownholeLabel = (param: DownholeType): string =>
    cond([
        [equals(DownholeType.CurrentFace), always(i18n.t(mainDict.tablet.downhole.currentFace))],
        [equals(DownholeType.ExplosionPacker), always(i18n.t(mainDict.tablet.downhole.explosionPacker))],
        [equals(DownholeType.PlugPacker), always(i18n.t(mainDict.tablet.downhole.plugPacker))],
        [T, always('')]
    ])(param);

export const getDownholeBriefLabel = (param: DownholeType): string =>
    cond([
        [equals(DownholeType.CurrentFace), always(i18n.t(mainDict.tablet.downholeBrief.currentFace))],
        [equals(DownholeType.ExplosionPacker), always(i18n.t(mainDict.tablet.downholeBrief.explosionPacker))],
        [equals(DownholeType.PlugPacker), always(i18n.t(mainDict.tablet.downholeBrief.plugPacker))],
        [T, always('')]
    ])(param);
