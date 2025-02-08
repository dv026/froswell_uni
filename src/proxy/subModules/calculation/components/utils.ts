import i18n from 'i18next';
import { always, cond, equals, last, T } from 'ramda';
import * as R from 'ramda';

import { AdaptationTypeEnum } from '../../../../calculation/entities/computation/adaptationTypeEnum';
import { AdaptationDynamics } from '../../../../calculation/entities/computation/calculationDetails';

import mainDict from '../../../../common/helpers/i18n/dictionary/main.json';

/**
 * Возвращает название типа адаптации по его типу. В случае невозможности определения названия возвращается пустая
 * строка
 */
export const getLabelByType = (mode: AdaptationTypeEnum): string =>
    cond([
        [equals(AdaptationTypeEnum.GeoModel), always(i18n.t(mainDict.calculation.geoModel))],
        [equals(AdaptationTypeEnum.SkinFactor), always(i18n.t(mainDict.calculation.skinFactor))],
        [equals(AdaptationTypeEnum.Permeabilities), always(i18n.t(mainDict.calculation.permeabilities))],
        [T, always('')]
    ])(mode);

/**
 * Возвращает тип адаптации для последней закончившейся итерации расчета.
 * Если такой итерации нет (когда в расчете еще не завершилась ни одна итерация), возвращает null.
 */
export const getLastFinishedAdaptationType = (dynamics: AdaptationDynamics[]) => {
    const lastAdaptation = last(dynamics ?? []);
    return lastAdaptation?.adaptationType;
};

export const getTickLabel = (iteration: number, dynamics: AdaptationDynamics[]): string => {
    if (!iteration || !dynamics) {
        return '';
    }

    const a = R.find(x => x.a === iteration, dynamics);
    return a?.isBest ? `${iteration}*` : `${iteration}`;
};
