import * as R from 'ramda';

import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import * as Prm from '../../../../common/helpers/parameters';
import { findOrDefault } from '../../../../common/helpers/ramda';
import {
    AdaptationDateINSIM,
    AdaptationINSIM,
    avgCalcPressure,
    avgCalcPressureBottomHole,
    avgCalcSkinFactor,
    avgRealPressure,
    avgRealPressureBottomHole,
    avgRealWatercut,
    calcWatercut,
    InitialTransmissibility,
    NeighborINSIM,
    NeighborTypeEnum,
    sumCalcInjection,
    sumCalcLiqRate,
    sumCalcOilRate,
    sumRealInjection,
    sumRealLiqRate,
    sumRealOilRate
} from '../../../entities/insim/well';
import { PlastInfo } from '../../../entities/report/plastInfo';
import { WellReport } from '../../../entities/report/wellReport';
import { isAquifer } from '../../../helpers/utils';
import { AllBestByNeighbors } from '../components/insimCharts/allBestByNeighbors';
import { BestByPlast } from '../components/insimCharts/bestByPlast';
import { ByPlast } from '../components/insimCharts/byPlast';
import { Common } from '../components/insimCharts/common';
import { ParameterEnum } from '../components/insimCharts/helpers';
import { NeighborParam } from '../components/insimCharts/neighborParam';
import { Overall } from '../components/insimCharts/overall';
import { ChartBuilder } from '../entities/chartBuilder';
import { GraphViewParam } from '../enums/graphViewParam';
import { modeName } from './modeNameManager';

export const createModes = (
    report: WellReport,
    plasts: PlastInfo[],
    wellName: string,
    showRepairs: boolean = false,
    modeType: ModeMapEnum = ModeMapEnum.Daily
): ChartBuilder[] => {
    if (!report || !report.insim) {
        return [];
    }

    const bestType = report.bestBy;
    const firstState = report.insim.adaptations;

    let modes = [];
    modes = [
        ...R.prepend(new Common(report.bestBy, null, showRepairs, modeType), modes),
        ...R.prepend(new BestByPlast(p => p.pressure, 'pressure_bestby', Prm.pressureRes(), plasts, bestType), modes),
        ...R.prepend(
            new BestByPlast(p => p.injection, 'injection_bestby', Prm.injectionRate(), plasts, bestType),
            modes
        ),
        ...R.prepend(new BestByPlast(p => p.liqRate, 'liqrate_bestby', Prm.liqrate(), plasts, bestType), modes),
        ...R.prepend(new BestByPlast(p => p.oilRate, 'oilrate_bestby', Prm.oilrate(), plasts, bestType), modes),
        ...R.prepend(
            new BestByPlast(
                p => p.bottomHolePressure,
                'pressureBottomHole_bestby',
                Prm.pressureZab(),
                plasts,
                bestType
            ),
            modes
        ),
        ...R.prepend(new BestByPlast(p => p.watercut, 'watercut_bestby', Prm.watercut(), plasts, bestType), modes),
        ...R.prepend(
            new BestByPlast(p => p.skinFactor, 'skinfactor_bestby', Prm.skinFactor(), plasts, bestType),
            modes
        ),
        ...R.prepend(
            new Overall(
                (a: AdaptationDateINSIM) => calcWatercut(a),
                (a: AdaptationDateINSIM) => avgRealWatercut(a),
                `watercut_all`,
                ParameterEnum.Watercut,
                Prm.watercut(),
                bestType,
                false,
                showRepairs
            ),
            modes
        ),
        ...R.prepend(
            new Overall(
                (a: AdaptationDateINSIM) => avgCalcPressure(a),
                (a: AdaptationDateINSIM) => avgRealPressure(a),
                `pressure_all`,
                ParameterEnum.Pressure,
                Prm.pressureRes(),
                bestType,
                true,
                showRepairs
            ),
            modes
        ),
        ...R.prepend(
            new Overall(
                (a: AdaptationDateINSIM) => sumCalcLiqRate(a),
                (a: AdaptationDateINSIM) => sumRealLiqRate(a),
                `liqrate_all`,
                ParameterEnum.LiqRate,
                Prm.liqrate(),
                bestType,
                false,
                showRepairs
            ),
            modes
        ),
        ...R.prepend(
            new Overall(
                (a: AdaptationDateINSIM) => sumCalcOilRate(a),
                (a: AdaptationDateINSIM) => sumRealOilRate(a),
                `oilrate_all`,
                ParameterEnum.OilRate,
                Prm.oilrate(),
                bestType,
                false,
                showRepairs
            ),
            modes
        ),
        ...R.prepend(
            new Overall(
                (a: AdaptationDateINSIM) => avgCalcPressureBottomHole(a),
                (a: AdaptationDateINSIM) => avgRealPressureBottomHole(a),
                `pressureBottomHole_all`,
                ParameterEnum.PressureBottomHole,
                Prm.pressureZab(),
                bestType,
                false,
                showRepairs
            ),
            modes
        ),
        ...R.prepend(
            new Overall(
                (a: AdaptationDateINSIM) => sumCalcInjection(a),
                (a: AdaptationDateINSIM) => sumRealInjection(a),
                `injection_all`,
                ParameterEnum.Injection,
                Prm.injectionRate(),
                bestType,
                false,
                showRepairs
            ),
            modes
        ),
        ...R.prepend(
            new Overall(
                (a: AdaptationDateINSIM) => avgCalcSkinFactor(a),
                (a: AdaptationDateINSIM) => avgCalcSkinFactor(a),
                `skinfactor_all`,
                ParameterEnum.SkinFactor,
                Prm.skinFactor(),
                bestType,
                false,
                showRepairs
            ),
            modes
        ),
        ...R.prepend(
            new AllBestByNeighbors(
                getNeighborFbl,
                'fbl_all',
                'f(S)',
                null,
                plasts,
                report.neighbors,
                wellName,
                bestType
            ),
            modes
        ),
        ...R.prepend(
            new AllBestByNeighbors(
                (x: NeighborINSIM) => x.transmissibility,
                'transmissibility_all',
                Prm.transmissibility(),
                null,
                plasts,
                report.neighbors,
                wellName,
                bestType
            ),
            modes
        ),
        ...R.prepend(
            new BestByPlast(p => p.watercut, GraphViewParam.PlastDistributionPercent, null, plasts, bestType),
            modes
        ),
        ...R.prepend(new BestByPlast(p => p.watercut, GraphViewParam.PlastDistribution, null, plasts, bestType), modes),
        ...R.prepend(
            new BestByPlast(p => p.watercut, GraphViewParam.ReserveDevelopment, null, plasts, bestType),
            modes
        ),
        ...R.prepend(
            new BestByPlast(p => p.watercut, GraphViewParam.RelativePermeability, null, plasts, bestType),
            modes
        ),
        ...R.prepend(new BestByPlast(p => p.watercut, GraphViewParam.WaterRateSource, null, plasts, bestType), modes),
        ...R.prepend(new BestByPlast(p => p.watercut, GraphViewParam.LiqRateSource, null, plasts, bestType), modes),
        ...R.prepend(new BestByPlast(p => p.watercut, GraphViewParam.AccumOilPlanFact, null, plasts, bestType), modes),
        ...R.prepend(new BestByPlast(p => p.watercut, GraphViewParam.LiquidBalance, null, plasts, bestType), modes)
    ];

    modes = R.concat(
        modes,
        R.map(n => createInsim(n, report), firstState[0].defaultNeighbors())
    );

    modes = R.concat(
        modes,
        R.map(n => createInsimFBL(n, report), firstState[0].defaultNeighbors())
    );
    modes = R.concat(
        modes,
        R.map(p => createInsimByPlastLiqRate(p, report), plasts)
    );
    modes = R.concat(
        modes,
        R.map(p => createInsimByPlastOilRate(p, report), plasts)
    );
    modes = R.concat(
        modes,
        R.map(p => createInsimByPlastWatercut(p, report), plasts)
    );
    modes = R.concat(
        modes,
        R.map(p => createInsimByPlastInjection(p, report), plasts)
    );
    modes = R.concat(
        modes,
        R.map(p => createInsimByPlastPressure(p, report), plasts)
    );
    modes = R.concat(
        modes,
        R.map(p => createInsimByPlastPressureBottomHole(p, report), plasts)
    );
    modes = R.concat(
        modes,
        R.map(p => createInsimByPlastSkinFactor(p, report), plasts)
    );
    modes = R.concat(
        modes,
        R.map(
            x =>
                new AllBestByNeighbors(
                    (x: NeighborINSIM) => x.transmissibility,
                    'transmissibility',
                    Prm.transmissibility(),
                    x.id,
                    plasts,
                    report.neighbors,
                    wellName,
                    bestType
                ),
            plasts
        )
    );
    modes = R.concat(
        modes,
        R.map(
            x =>
                new AllBestByNeighbors(
                    getNeighborFbl,
                    'fbl',
                    Prm.fbl(),
                    x.id,
                    plasts,
                    report.neighbors,
                    wellName,
                    bestType
                ),
            plasts
        )
    );

    modes = R.concat(
        modes,
        R.map(x => new Common(report.bestBy, x.id, showRepairs, modeType), plasts)
    );

    modes = R.concat(modes, []);
    return modes;
};

const findBefore = (
    initials: InitialTransmissibility[],
    wellId: number,
    plastId: number,
    type: NeighborTypeEnum
): number =>
    R.find(x => x.plastId === plastId && (isAquifer(type) ? x.type === type : x.wellId === wellId), initials)?.before ??
    0;

const findCalcTransmissibility = (x: NeighborINSIM[], plastId: number, wellId: number, type: NeighborTypeEnum) =>
    findOrDefault(
        y => y.type === type && y.wellId === wellId && y.plastId === plastId,
        x => x.transmissibility,
        null,
        x
    );

const findCalcFBL = (x: NeighborINSIM[], plastId: number, wellId: number, type: NeighborTypeEnum) =>
    findOrDefault(y => y.type === type && y.wellId === wellId && y.plastId === plastId, getNeighborFbl, 0, x);
const createInsim = (n: NeighborINSIM, report: WellReport) => {
    return new NeighborParam(
        (x: AdaptationDateINSIM) =>
            findCalcTransmissibility(R.isNil(x) ? [] : x.neighbors, n.plastId, n.wellId, n.type),
        (x: AdaptationINSIM) => findBefore(x.initialTransmissibilities, n.wellId, n.plastId, n.type),
        modeName('transmissibility', n.plastId, n.wellId),
        ParameterEnum.Transmissibility,
        report.bestBy,
        true,
        Prm.transmissibility()
    );
};

const createInsimFBL = (n: NeighborINSIM, report: WellReport) => {
    return new NeighborParam(
        (x: AdaptationDateINSIM) => findCalcFBL(R.isNil(x) ? [] : x.neighbors, n.plastId, n.wellId, n.type),
        () => null,
        modeName('fbl', n.plastId, n.wellId),
        ParameterEnum.FBL,
        report.bestBy,
        false,
        Prm.fbl()
    );
};

const createInsimByPlast = (
    plast: PlastInfo,
    param: ParameterEnum,
    unit: string,
    getCalc,
    getReal,
    report: WellReport,
    dottedReal: boolean = false
) => new ByPlast(getCalc, getReal, param, modeName(param, plast.id), unit, report.bestBy, dottedReal);

const createInsimByPlastLiqRate = (plast: PlastInfo, report: WellReport) =>
    createInsimByPlast(
        plast,
        ParameterEnum.LiqRate,
        Prm.liqrate(),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.liqRate,
                null,
                R.isNil(x) ? null : x.calculatedProps
            ),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.liqRate,
                null,
                R.isNil(x) ? null : x.realProps
            ),
        report
    );

const createInsimByPlastOilRate = (plast: PlastInfo, report: WellReport) =>
    createInsimByPlast(
        plast,
        ParameterEnum.OilRate,
        Prm.oilrate(),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.oilRate,
                null,
                R.isNil(x) ? null : x.calculatedProps
            ),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.oilRate,
                null,
                R.isNil(x) ? null : x.realProps
            ),
        report
    );

const createInsimByPlastWatercut = (plast: PlastInfo, report: WellReport) =>
    createInsimByPlast(
        plast,
        ParameterEnum.Watercut,
        Prm.watercut(),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.watercut,
                null,
                R.isNil(x) ? null : x.calculatedProps
            ),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.watercut,
                null,
                R.isNil(x) ? null : x.realProps
            ),
        report
    );

const createInsimByPlastPressure = (plast: PlastInfo, report: WellReport) =>
    createInsimByPlast(
        plast,
        ParameterEnum.Pressure,
        Prm.pressureRes(),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.pressure,
                null,
                R.isNil(x) ? null : x.calculatedProps
            ),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.pressure,
                null,
                R.isNil(x) ? null : x.realProps
            ),
        report,
        true
    );

const createInsimByPlastPressureBottomHole = (plast: PlastInfo, report: WellReport) =>
    createInsimByPlast(
        plast,
        ParameterEnum.PressureBottomHole,
        Prm.pressureZab(),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.bottomHolePressure,
                null,
                R.isNil(x) ? null : x.calculatedProps
            ),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.bottomHolePressure,
                null,
                R.isNil(x) ? null : x.realProps
            ),
        report,
        true
    );

const createInsimByPlastInjection = (plast: PlastInfo, report: WellReport) =>
    createInsimByPlast(
        plast,
        ParameterEnum.Injection,
        Prm.injectionRate(),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.injection,
                null,
                R.isNil(x) ? null : x.calculatedProps
            ),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.injection,
                null,
                R.isNil(x) ? null : x.realProps
            ),
        report
    );

const createInsimByPlastSkinFactor = (plast: PlastInfo, report: WellReport) =>
    createInsimByPlast(
        plast,
        ParameterEnum.SkinFactor,
        Prm.skinFactor(),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.skinFactor,
                null,
                R.isNil(x) ? null : x.calculatedProps
            ),
        (x: AdaptationDateINSIM) =>
            findOrDefault(
                y => y.plastId === plast.id,
                y => y.skinFactor,
                null,
                R.isNil(x) ? null : x.realProps
            ),
        report,
        true
    );

const getNeighborFbl = (x: NeighborINSIM) => x.fbl || 0;
