import { always, ifElse, map } from 'ramda';
import { atom, selector } from 'recoil';

import { PlastDetail, PlastDistributionModel } from '../../../../calculation/entities/plastDistributionModel';
import { ReserveDevelopmentWrapper } from '../../../../calculation/entities/reserveDevelopmentWrapper';
import { DataModelType } from '../../../../calculation/enums/dataModelType';
import { ModeMapEnum } from '../../../../common/enums/modeMapEnum';
import { isNullOrEmpty, shallow } from '../../../../common/helpers/ramda';
import { BestAdaptationEnum, isBestByOil } from '../../../../proxy/subModules/calculation/enums/bestAdaptationEnum';
import { getPlastDistributions } from '../../../../proxy/subModules/results/gateways/gateway';
import { PlastPropsDynamic, WellDetailsModel } from '../../../entities/wellDetailsModel';
import { currentSpot } from '../../../store/well';
import { ChartType } from '../enums/chartType';
import { getMultiplePrediction, getPrediction, getReserveDevelopment } from '../gateways/gateway';
import { chartTypeState } from './chartType';
import { currentPlastId } from './currentPlastId';
import { dataModelTypeState } from './dataModelType';
import { modeMapTypeState } from './modeMapType';
import { selectedWellsState } from './selectedWells';

const extractWellData = (response): PlastPropsDynamic[] =>
    ifElse(isNullOrEmpty, always(null), x => [PlastPropsDynamic.fromRaw(x)])(response.data);

const wellDetailsLoad = selector<WellDetailsModel>({
    key: 'predictionResults__wellDetailsLoad',
    get: async ({ get }) => {
        const modeMapType = get(modeMapTypeState);
        const plastId = get(currentPlastId);
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);

        const wellDetails = new WellDetailsModel(well, [], BestAdaptationEnum.ByOil, []);

        const { data: initialPrediction } = await getPrediction(
            map(it => it.id, selectedWells),
            well,
            plastId,
            isBestByOil(wellDetails.adaptationType),
            modeMapType === ModeMapEnum.Accumulated
        );

        const WellDetailsWithData: WellDetailsModel = shallow(wellDetails, {
            data: extractWellData(initialPrediction)
        });

        return WellDetailsWithData;
    }
});

export const wellDetailsState = atom<WellDetailsModel>({
    key: 'predictionResults__wellDetailsState',
    default: wellDetailsLoad
});

export const plastDistributions = selector<PlastDistributionModel[]>({
    key: 'predictionResults__plastDistributions',
    get: async ({ get }) => {
        const dataModelType = get(dataModelTypeState);
        const chartType = get(chartTypeState);
        const well = get(currentSpot);
        const selectedWells = get(selectedWellsState);

        let currentWells = isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells);

        const response = await getPlastDistributions(well, currentWells);

        return map(
            it =>
                new PlastDistributionModel(
                    it.dt,
                    map(x => {
                        const isPercent = chartType === ChartType.PlastDistributionPercent;
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
    key: 'predictionResults__reserveDevelopmentSelector',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);

        let currentWells = isNullOrEmpty(selectedWells) ? [well.id] : map(it => it.id, selectedWells);

        const response = await getReserveDevelopment(well, plastId, currentWells);

        return response.data;
    }
});

export const multipleWellDetailsSelector = selector<WellDetailsModel[]>({
    key: 'predictionResults__multipleWellDetailsSelector',
    get: async ({ get }) => {
        const plastId = get(currentPlastId);
        const selectedWells = get(selectedWellsState);
        const well = get(currentSpot);

        const wellDetails = new WellDetailsModel(well, [], BestAdaptationEnum.ByOil, []);

        const { data } = await getMultiplePrediction(selectedWells, plastId);

        return map(
            it =>
                shallow(wellDetails, {
                    data: extractWellData(it)
                }),
            data
        );
    }
});
