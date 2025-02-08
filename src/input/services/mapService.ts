import * as R from 'ramda';
import { map, uniq } from 'ramda';

import { Point } from '../../common/entities/canvas/point';
import { Donut, DrilledWellPoint, InjWellPoint, OilWellPoint, WellPointDonut } from '../../common/entities/wellPoint';
import { WellTypeEnum } from '../../common/enums/wellTypeEnum';

export class MapService {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static get = data => {
        const mapper = it => {
            if (it.isImaginaryWell) {
                return null;
            }

            return it.charWorkId === WellTypeEnum.Oil
                ? new OilWellPoint(
                      it.wellId,
                      it.x,
                      it.y,
                      it.name,
                      it.x2 && it.y2 ? [new Point(it.x, it.y), new Point(it.x2, it.y2)] : [],
                      it.grpState,
                      new Donut(
                          it.p2,
                          it.p3,
                          it.p2Accumulated,
                          it.p3Accumulated,
                          it.p4Accumulated,
                          it.oilRadius,
                          it.injRadius,
                          it.perfPercentage
                      ),
                      it.trajectories
                  )
                : new InjWellPoint(
                      it.wellId,
                      it.x,
                      it.y,
                      it.name,
                      it.x2 && it.y2 ? [new Point(it.x, it.y), new Point(it.x2, it.y2)] : [],
                      [],
                      it.grpState,
                      it.effectiveInjection,
                      new Donut(
                          it.p2,
                          it.p3,
                          it.p2Accumulated,
                          it.p3Accumulated,
                          it.p4Accumulated,
                          it.oilRadius,
                          it.injRadius,
                          it.perfPercentage
                      ),
                      it.trajectories
                  );
        };

        return uniq(map(mapper, data));
    };

    public static getFull = data => {
        const mapper = it => {
            if (it.isImaginaryWell) {
                return null;
            }

            return it.charWorkId === WellTypeEnum.Oil
                ? new OilWellPoint(
                      it.wellId,
                      it.x,
                      it.y,
                      it.name,
                      it.x2 && it.y2 ? [new Point(it.x, it.y), new Point(it.x2, it.y2)] : [],
                      it.grpState,
                      new Donut(
                          it.p2,
                          it.p3,
                          it.p2Accumulated,
                          it.p3Accumulated,
                          it.p4Accumulated,
                          it.oilRadius,
                          it.injRadius,
                          it.perfPercentage,
                          it.liquidRadiusNatural,
                          it.injectionRadiusNatural
                      ),
                      it.trajectories,
                      it.plastId,
                      it.plastName,
                      it.plastNumber
                  )
                : new InjWellPoint(
                      it.wellId,
                      it.x,
                      it.y,
                      it.name,
                      it.x2 && it.y2 ? [new Point(it.x, it.y), new Point(it.x2, it.y2)] : [],
                      [],
                      it.grpState,
                      it.effectiveInjection,
                      new Donut(
                          it.p2,
                          it.p3,
                          it.p2Accumulated,
                          it.p3Accumulated,
                          it.p4Accumulated,
                          it.oilRadius,
                          it.injRadius,
                          it.perfPercentage,
                          it.liquidRadiusNatural,
                          it.injectionRadiusNatural
                      ),
                      it.trajectories,
                      it.plastId,
                      it.plastName,
                      it.plastNumber
                  );
        };

        return R.map(mapper, data);
    };

    public static getDrilledFoundation = (data: WellPointDonut[]): DrilledWellPoint[] => {
        const mapper = it =>
            new DrilledWellPoint(
                it.wellId,
                it.x,
                it.y,
                it.name,
                it.x2 && it.y2 ? [new Point(it.x, it.y), new Point(it.x2, it.y2)] : [],
                it.trajectories
            );

        return R.map(mapper, data);
    };
}
