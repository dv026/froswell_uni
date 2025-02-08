import React, { FC, memo } from 'react';

import { Box, Checkbox, Flex, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import i18n from 'i18next';
import { map, pipe, prepend, uniqBy, length, cond, always, head, T, any, isNil } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useRecoilValueLoadable, useResetRecoilState } from 'recoil';

import { DataModelType } from '../../../../../calculation/enums/dataModelType';
import { Dropdown, DropdownOption } from '../../../../../common/components/dropdown/dropdown';
import { ChartCompareEnum } from '../../../../../common/enums/chartCompareEnum';
import { tryParse } from '../../../../../common/helpers/number';
import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { hasValue } from '../../../../../common/helpers/recoil';
import { BestAdaptationEnum, isBestByOil } from '../../../../../proxy/subModules/calculation/enums/bestAdaptationEnum';
import { AdaptationBriefModel } from '../../../../entities/adaptationBriefModel';
import { ChartType } from '../../enums/chartType';
import { chartCompareState } from '../../store/chartCompare';
import { chartTypeState } from '../../store/chartType';
import { currentAdaptationTypeState } from '../../store/currentAdaptationType';
import { currentPlastId, modulePlasts } from '../../store/currentPlastId';
import { dataModelTypeState } from '../../store/dataModelType';
import { mapSettingsState } from '../../store/mapSettings';
import { showRepairsState } from '../../store/showRepairs';
import { wellDetailsState } from '../../store/wellDetails';
import { ModeMapDropdown } from '../modeMapDropdown';
import { ModuleCompareDropdown } from '../moduleCompareDropdown';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const ChartSettings: FC = memo(() => {
    const { t } = useTranslation();

    const compareParam = useRecoilValue(chartCompareState);
    const plasts = useRecoilValue(modulePlasts);

    const [chartType, setChartType] = useRecoilState(chartTypeState);
    const [dataModelType, setDataModelType] = useRecoilState(dataModelTypeState);
    const [plastId, setPlastId] = useRecoilState(currentPlastId);
    const [showRepairs, setShowRepairs] = useRecoilState(showRepairsState);

    const resetMapSettings = useResetRecoilState(mapSettingsState);

    const isDynamic = chartType === ChartType.Dynamic;
    const isPlastDistribution =
        chartType === ChartType.PlastDistribution || chartType === ChartType.PlastDistributionPercent;

    const isCompareChart = compareParam !== ChartCompareEnum.Sum;

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack spacing={4}>
                    <FormControl variant='inline'>
                        <FormLabel>{t(dict.common.currentPlast)}:</FormLabel>
                        <Dropdown
                            className='action__selector'
                            options={prepend(
                                new DropdownOption(null, t(dict.common.dataBy.object)),
                                map(p => new DropdownOption(p.id, p.name), plasts)
                            )}
                            value={plastId}
                            onChange={e => {
                                setPlastId(tryParse(e.target.value));
                                resetMapSettings();
                            }}
                        />
                    </FormControl>

                    {!isCompareChart ? (
                        <>
                            <FormControl variant='inline'>
                                <FormLabel>{t(dict.common.chart)}:</FormLabel>
                                <Dropdown
                                    options={[
                                        new DropdownOption(ChartType.Dynamic, t(dict.common.dynamics)),
                                        new DropdownOption(
                                            ChartType.PlastDistributionPercent,
                                            t(dict.common.distributionBy.plastPercent)
                                        ),
                                        new DropdownOption(
                                            ChartType.PlastDistribution,
                                            t(dict.common.distributionBy.plast)
                                        ),
                                        new DropdownOption(
                                            ChartType.ProductionCalculation,
                                            t(dict.common.distributionBy.productionCalculation)
                                        )
                                    ]}
                                    value={chartType}
                                    onChange={e => setChartType(+e.target.value)}
                                />
                            </FormControl>
                            {isPlastDistribution ? (
                                <FormControl variant='inline'>
                                    <FormLabel>{t(dict.prediction.dataModel)}:</FormLabel>
                                    <Dropdown
                                        options={[
                                            new DropdownOption(DataModelType.Oil, t(dict.common.dataBy.oil)),
                                            new DropdownOption(DataModelType.Liq, t(dict.common.dataBy.liquid)),
                                            new DropdownOption(DataModelType.Inj, t(dict.common.dataBy.injection))
                                        ]}
                                        value={dataModelType}
                                        onChange={e => setDataModelType(+e.target.value)}
                                    />
                                </FormControl>
                            ) : null}
                            {isDynamic && (
                                <FormControl variant='inline'>
                                    <FormLabel>{t(dict.proxy.bestModel)}:</FormLabel>
                                    <AdaptationSelector />
                                </FormControl>
                            )}
                        </>
                    ) : null}
                    {!isCompareChart && <ModeMapDropdown />}
                    <>
                        {isDynamic && <ModuleCompareDropdown />}
                        <FormControl variant='inline'>
                            <FormLabel>{t(dict.common.showPepairs)}:</FormLabel>
                            <Checkbox isChecked={showRepairs} onChange={e => setShowRepairs(e.target.checked)} />
                        </FormControl>
                    </>
                </HStack>
            </Flex>
        </Box>
    );
});

const AdaptationSelector = () => {
    const { t } = useTranslation();

    const wellDetailsLoadable = useRecoilValueLoadable(wellDetailsState);

    const [adaptationType, setAdaptationType] = useRecoilState(currentAdaptationTypeState);

    const wellDetails = hasValue(wellDetailsLoadable) ? wellDetailsLoadable.contents : null;

    if (isNil(wellDetails) || isNullOrEmpty(wellDetails.adaptations)) {
        return <div>-</div>;
    }

    // true - только одна адаптация является лучшей и по нефти, и по давлению
    // false - есть несколько адаптаций с разными id
    const isOnly = (a: AdaptationBriefModel[]) =>
        pipe(
            uniqBy<AdaptationBriefModel, BestAdaptationEnum>(x => x.id),
            x => length(x) === 1
        )(a);

    // если есть только одна лучшая адаптация
    if (isOnly(wellDetails.adaptations)) {
        const title = (a: AdaptationBriefModel[]): string =>
            cond([
                // адаптация лучшая и по нефти, и по давлению
                [(x: AdaptationBriefModel[]) => length(x) === 2, always(t(dict.proxy.byOilAndPressure))],

                // для скважины посчитана только одна лучшая адаптация - и она по нефти
                [(x: AdaptationBriefModel[]) => isBestByOil(head(x).type), always(t(dict.proxy.byOil))],

                // для скважины посчитана только одна лучшая адаптация - и она по давлению
                [T, always(t(dict.proxy.byPressure))]
            ])(a);

        return <div>{title(wellDetails.adaptations)}</div>;
    }

    return (
        <Dropdown
            className='action__selector'
            options={adaptationTypeOptions(wellDetails.adaptations)}
            value={adaptationType}
            onChange={e => setAdaptationType(+e.target.value)}
        />
    );
};

const adaptationTypeOptions = (adaptations: AdaptationBriefModel[]): DropdownOption[] => {
    if (isNullOrEmpty(adaptations)) {
        return [];
    }

    let options = [];
    if (any(x => x.type === BestAdaptationEnum.ByOil, adaptations)) {
        options.push(new DropdownOption(BestAdaptationEnum.ByOil, i18n.t(dict.proxy.byOil)));
    }

    if (any(x => x.type === BestAdaptationEnum.ByPressure, adaptations)) {
        options.push(new DropdownOption(BestAdaptationEnum.ByPressure, i18n.t(dict.proxy.byPressure)));
    }

    return options;
};
