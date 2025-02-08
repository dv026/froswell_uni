import { find, map } from 'ramda';
import { atom, selector } from 'recoil';

import { Range } from '../../common/entities/range';
import { PredictionListWell, ProxyListWell } from '../../common/entities/wellModel';
import { isFalsy, shallow } from '../../common/helpers/ramda';
//import { hasValue } from '../../common/helpers/recoil';
import { ActiveCalculation } from '../../proxy/entities/activeCalculation';
//import { LoadWellPayload } from '../entities/payloads';
import { PlastModel } from '../../proxy/entities/plastModel';
import { CalculationTemplate, WellDetailsModel } from '../../proxy/entities/wellDetailsModel';
import { CalculationDataEnum } from '../../proxy/subModules/calculation/enums/calculationDataEnum';
import { WellGroupItem } from '../entities/wellGroupItem';
import { currentScenarioId } from './currentScenarioId';
import { initialSettings } from './initialSettings';

const errorOrNull = (errorProp: string, templates: CalculationTemplate[], currentScenarioId: number) =>
    find(x => x.scenarioId === currentScenarioId, templates)?.[errorProp];

export interface ProxySharedState {
    adaptationRange: Range<Date>;
    calculationData: CalculationDataEnum;
    isLoading: boolean;
    //mapPlastId: number;
    //gridPlastId: number;
    plasts: PlastModel[];
    well: WellDetailsModel;
    wells: ProxyListWell[];
    templateNew: CalculationTemplate;
    templates: CalculationTemplate[];
    //modeParams: [CalculationModeEnum, InsimCalculationParams][];

    /**
     * список элементов,по которым должен производиться расчет.
     * Если расчет в режиме адаптации или улучшения адаптации, то это id сценариев
     * Если расчет в режиме прогноза, то это id подсценариев
     */
    itemsToCalculate: number[];

    /**
     * Список активных расчетов по объекту разработки.
     * null - список активных расчетов еще не запрашивался с сервера
     * []   - список активных расчетов уже получен с сервера (в т.ч. пустой массив показывает наличие запроса,
     *          но отсутствие таких расчетов)
     */
    activeCalculations: ActiveCalculation[];

    /**
     * Список скважин для оптимизации
     */
    wellsForOptimization: WellGroupItem[];

    /**
     * Список скважин для страниц Настройка скважин и Цели оптимизации
     */
    wellsForPrediction: PredictionListWell[];
}

export const initialState: ProxySharedState = {
    adaptationRange: new Range<Date>(new Date(), new Date()),
    calculationData: CalculationDataEnum.Create,
    isLoading: false,
    plasts: [],
    well: null,
    wells: null,
    templateNew: new CalculationTemplate(),
    templates: [],
    itemsToCalculate: [],
    activeCalculations: null,
    wellsForOptimization: [],
    wellsForPrediction: []
};

const proxySharedLoad = selector<ProxySharedState>({
    key: 'calculation__proxySharedLoad',
    get: async ({ get }) => {
        const payload = get(initialSettings);

        if (!payload) {
            return null;
        }

        const { adaptationRange, sublayers, templates, templateNew, well } = payload;

        if (isFalsy(well)) {
            throw new Error("Well you are trying to switch on doesn't exist");
        }

        const plasts = map(
            (x): PlastModel => ({
                id: x.id,
                name: x.name,
                formulas: {
                    above: {
                        c1: x.aboveJumpPointWaterC1,
                        c2: x.aboveJumpPointWaterC2,
                        c3: x.aboveJumpPointWaterC3
                    },
                    below: {
                        c1: x.belowJumpPointWaterC1,
                        c2: x.belowJumpPointWaterC2
                    }
                },
                volume: 0,
                waterSaturation: {
                    initial: 0,
                    jumpPoint: 0,
                    limit: 0
                }
            }),
            sublayers || []
        );

        return shallow(initialState, {
            adaptationRange: adaptationRange,
            plasts,
            isLoading: false,
            well,
            templates,
            templateNew
        });
    }
});

export const proxySharedState = atom<ProxySharedState>({
    key: 'calculation__proxySharedState',
    default: proxySharedLoad
});

export const currentScenarioErrors = selector<number[]>({
    key: 'calculation__currentScenarioErrors',
    get: async ({ get }) => {
        const shared = get(proxySharedState);
        const scenarioId = get(currentScenarioId);

        if (!shared) {
            return [];
        }

        return [
            errorOrNull('oilErrorTotalMAPE', shared.templates, scenarioId),
            errorOrNull('liqErrorTotalMAPE', shared.templates, scenarioId)
        ];
    }
});
