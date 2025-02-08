import i18n from 'i18next';
import { always, cond, equals, T } from 'ramda';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export enum GeologicalReserveType {
    All = 1,
    LicenseBorder = 2,
    AdaptationBorder = 3
}

export const getLabel = (mode: GeologicalReserveType): string =>
    cond([
        [equals(GeologicalReserveType.All), always(i18n.t(dict.common.all))],
        [equals(GeologicalReserveType.LicenseBorder), always(i18n.t(dict.proxy.wellGrid.geoReserves.licenseBorder))],
        [
            equals(GeologicalReserveType.AdaptationBorder),
            always(i18n.t(dict.proxy.wellGrid.geoReserves.adaptationBorder))
        ],
        [T, always('')]
    ])(mode);
