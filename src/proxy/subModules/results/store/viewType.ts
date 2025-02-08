import { always, any, concat, cond, equals, filter, flatten, head, map, pipe, T } from 'ramda';
import { atom, selector } from 'recoil';

import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { NeighborINSIM, NeighborTypeEnum, WellINSIM } from '../../../entities/insim/well';
import { overAllPlastsId } from '../components/chartSelector';
import { GraphViewParam } from '../enums/graphViewParam';
import { findNewMode, modeName } from '../helpers/modeNameManager';
import { renderModesSelector } from './currentMode';
import { reportState } from './report';
import { сurrentParamIdState } from './сurrentParamId';

const saturationNeighbors = (well: WellINSIM, neighbors: NeighborINSIM[]) =>
    filter(
        x => any(y => x.wellId === y.neighborWellId && x.plastId === y.plastId, well?.frontTracking?.neighbors || []),
        neighbors || []
    );

const viewTypeState = atom<GraphViewParam>({
    key: 'proxyResults__viewTypeState',
    default: GraphViewParam.Common
});

export const viewTypeSelector = selector<GraphViewParam>({
    key: 'proxyResults__viewTypeSelector',
    get: async ({ get }) => {
        return get(viewTypeState);
    },
    set: ({ get, set }, viewType: GraphViewParam) => {
        const newModes = get(renderModesSelector);
        const report = get(reportState);

        const chartsData = report?.insim?.adaptations ?? [];

        const neighbors = chartsData[0].defaultNeighbors() ?? [];
        const saturationModes = pipe(
            x => saturationNeighbors(report.insim, x),
            x =>
                map(
                    (x: NeighborINSIM) => [
                        modeName('fronttracking', x.plastId, x.wellId),
                        modeName('minl', x.plastId, x.wellId)
                    ],
                    filter(it => it.type === NeighborTypeEnum.Well, x)
                ),
            flatten
        )(neighbors);

        const tempParamId = cond([
            [x => equals(GraphViewParam.Common, x), always(modeName('common'))],
            [x => equals(GraphViewParam.Saturation, x), always(head(saturationModes))],
            [x => equals(GraphViewParam.Watercut, x), always(overAllPlastsId(GraphViewParam.Watercut))],
            [x => equals(GraphViewParam.Pressure, x), always(overAllPlastsId(GraphViewParam.Pressure))],
            [x => equals(GraphViewParam.Liquid, x), always(overAllPlastsId(GraphViewParam.Liquid))],
            [x => equals(GraphViewParam.Oilrate, x), always(overAllPlastsId(GraphViewParam.Oilrate))],
            [
                x => equals(GraphViewParam.PressureBottomHole, x),
                always(overAllPlastsId(GraphViewParam.PressureBottomHole))
            ],
            [x => equals(GraphViewParam.Injection, x), always(overAllPlastsId(GraphViewParam.Injection))],
            [x => equals(GraphViewParam.SkinFactor, x), always(overAllPlastsId(GraphViewParam.SkinFactor))],
            [x => equals(GraphViewParam.Transmissibility, x), always('transmissibility_all')],
            [x => equals(GraphViewParam.Fbl, x), always('fbl_all')],
            [x => equals(GraphViewParam.PlastDistributionPercent, x), always(GraphViewParam.PlastDistributionPercent)],
            [x => equals(GraphViewParam.PlastDistribution, x), always(GraphViewParam.PlastDistribution)],
            [x => equals(GraphViewParam.ReserveDevelopment, x), always(GraphViewParam.ReserveDevelopment)],
            [x => equals(GraphViewParam.RelativePermeability, x), always(GraphViewParam.RelativePermeability)],
            [x => equals(GraphViewParam.WaterRateSource, x), always(GraphViewParam.WaterRateSource)],
            [x => equals(GraphViewParam.LiqRateSource, x), always(GraphViewParam.LiqRateSource)],
            [x => equals(GraphViewParam.AccumOilPlanFact, x), always(GraphViewParam.AccumOilPlanFact)],
            [x => equals(GraphViewParam.LiquidBalance, x), always(GraphViewParam.LiquidBalance)],
            [T, always(null)]
        ])(viewType);

        const newParamId = isNullOrEmpty(newModes)
            ? tempParamId // режимы отображения отсутствуют -> оставить текущий
            : any(x => x.name() === tempParamId, newModes)
            ? tempParamId // текущий режим есть среди новых режимов -> оставить его текущим
            : findNewMode(
                  tempParamId,
                  !isNullOrEmpty(newModes)
                      ? concat(
                            map(x => x.name(), newModes),
                            saturationModes
                        )
                      : null
              ); // текущего режима нет среди новых -> выбрать первый из новых

        set(сurrentParamIdState, newParamId);
        set(viewTypeState, viewType);
    }
});
