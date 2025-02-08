import { ProxyAccumOilPlanFact } from 'calculation/entities/proxyAccumOilPlanFact';
import { ProxyLiquidBalance } from 'calculation/entities/proxyLiquidBalance';
import { map, pathOr, split, takeLast } from 'ramda';
import { selector } from 'recoil';

import { PlastDetail, PlastDistributionModel } from '../../../../calculation/entities/plastDistributionModel';
import { RelativePermeabilityWrapper } from '../../../../calculation/entities/relativePermeabilityWrapper';
import { ReserveDevelopmentWrapper } from '../../../../calculation/entities/reserveDevelopmentWrapper';
import { DataModelType } from '../../../../calculation/enums/dataModelType';
import { currentScenarioId } from '../../../../calculation/store/currentScenarioId';
import { currentProductionObjectId, currentWellId } from '../../../../calculation/store/userWell';
import { isNullOrEmpty, shallow } from '../../../../common/helpers/ramda';
import { WellINSIM } from '../../../entities/insim/well';
import { NeighborModel } from '../../../entities/neighborModel';
import { PlastInfo } from '../../../entities/report/plastInfo';
import { create, WellReport } from '../../../entities/report/wellReport';
import { currentSpot } from '../../../store/well';
import { isBestByOil } from '../../calculation/enums/bestAdaptationEnum';
import { GraphViewParam } from '../enums/graphViewParam';
import {
    getAccumOilPlanFact,
    getLiquidBalance,
    getPlastDistributions,
    getRelativePermeabilities,
    getReserveDevelopment,
    loadInsim
} from '../gateways/gateway';
import { dataModelTypeState } from './dataModelType';
import { selectedWellsState } from './selectedWells';
import { viewTypeSelector } from './viewType';
import { сurrentParamIdState } from './сurrentParamId';

export const reportState = selector<WellReport>({
    key: 'proxyResults__reportState',
    get: async ({ get }) => {
        const prodObjId = get(currentProductionObjectId);
        const scenarioId = get(currentScenarioId);
        const selectedWells = get(selectedWellsState);
        const wellId = get(currentWellId);

        if (!prodObjId || !scenarioId) {
            return null;
        }

        const report = create([scenarioId, null]);

        const responseInsim = await loadInsim(
            wellId,
            prodObjId,
            isBestByOil(report.bestBy),
            report.adaptationCount,
            report.schemaId,
            map(it => it.id, selectedWells)
        );

        return shallow(report, {
            //adaptationWells: responseData.data.data,
            plasts: responseInsim.data?.plasts as PlastInfo[],
            plastId: null,
            insim: WellINSIM.fromRaw(responseInsim.data?.data),
            neighbors: map(NeighborModel.fromRaw, pathOr([], ['data', 'neighbors'], responseInsim.data))
        });
    }
});

export const plastDistributions = selector<PlastDistributionModel[]>({
    key: 'proxyResults__plastDistributions',
    get: async ({ get }) => {
        const dataModelType = get(dataModelTypeState);
        const selectedWells = get(selectedWellsState);
        const viewType = get(viewTypeSelector);
        const well = get(currentSpot);

        let currentWells = isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells);

        const response = await getPlastDistributions(well, currentWells);

        return map(
            it =>
                new PlastDistributionModel(
                    it.dt,
                    map(x => {
                        const isPercent = viewType === GraphViewParam.PlastDistributionPercent;
                        const isOil = dataModelType === DataModelType.Oil;
                        const isLiq = dataModelType === DataModelType.Liq;
                        const isInj = dataModelType === DataModelType.Inj;

                        let value = 0;

                        if (isOil) {
                            value = isPercent ? x.perOil : x.sumPlastOilRateINSIM;
                        } else if (isLiq) {
                            value = isPercent ? x.perLiq : x.sumPlastLiqRateINSIM;
                        } else if (isInj) {
                            value = isPercent ? x.perInj : x.sumPlastInjectionINSIM;
                        }

                        return new PlastDetail(x.plastId, x.plastName, value);
                    }, it.details)
                ),
            response.data
        );
    }
});

export const reserveDevelopmentSelector = selector<ReserveDevelopmentWrapper>({
    key: 'proxyResults__reserveDevelopmentSelector',
    get: async ({ get }) => {
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);

        let currentWells = isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells);

        const response = await getReserveDevelopment(well, currentWells);

        return response.data;
    }
});

export const relativePermeabilitySelector = selector<RelativePermeabilityWrapper>({
    key: 'proxyResults__relativePermeabilitySelector',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const currentParamId = get(сurrentParamIdState);
        const report = get(reportState);

        const params = takeLast(2, split('-', currentParamId));

        // TODO: продумать более корректный способ проверки. Пока проверять правильность данных путем проверки наличия списка пластов
        if (!params || !report?.plasts) {
            return null;
        }

        const plastId = +params[1] ? +params[1] : report?.plasts[0]?.id;

        const response = await getRelativePermeabilities(well, plastId);

        return response.data;
    }
});

export const accumOilPlanFactSelector = selector<ProxyAccumOilPlanFact[]>({
    key: 'proxyResults__accumOilPlanFactSelector',
    get: async ({ get }) => {
        const well = get(currentSpot);

        const response = await getAccumOilPlanFact(well);

        return response.data;
    }
});

export const liquidBalanceSelector = selector<ProxyLiquidBalance[]>({
    key: 'proxyResults__liquidBalanceSelector',
    get: async ({ get }) => {
        const well = get(currentSpot);
        const currentParamId = get(сurrentParamIdState);
        const report = get(reportState);

        const params = takeLast(2, split('-', currentParamId));

        const plastId = +params[1] ? +params[1] : report?.plasts[0]?.id;

        const response = await getLiquidBalance(well, plastId);

        return response.data;
    }
});
