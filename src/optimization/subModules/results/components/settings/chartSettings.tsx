import React, { FC, memo } from 'react';

import { Box, Checkbox, Flex, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import i18n from 'i18next';
import { map, prepend } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { DataModelType } from '../../../../../calculation/enums/dataModelType';
import { Dropdown, DropdownOption } from '../../../../../common/components/dropdown/dropdown';
import { ChartCompareEnum } from '../../../../../common/enums/chartCompareEnum';
import { ModeMapEnum } from '../../../../../common/enums/modeMapEnum';
import { WellTypeEnum } from '../../../../../common/enums/wellTypeEnum';
import { tryParse } from '../../../../../common/helpers/number';
import { ChartType } from '../../../../../prediction/subModules/results/enums/chartType';
import { currentPlastId, modulePlasts } from '../../../../../prediction/subModules/results/store/currentPlastId';
import { DataModeEnum } from '../../enums/dataModeEnum';
import { chartCompareState } from '../../store/chartCompare';
import { chartTypeState } from '../../store/chartType';
import { dataModeState } from '../../store/dataMode';
import { dataModelTypeState } from '../../store/dataModelType';
import { mapSettingsState } from '../../store/mapSettings';
import { modeMapTypeState } from '../../store/modeMapType';
import { showRepairsState } from '../../store/showRepairs';
import { charworksSelector } from '../../store/siteDetails';
import { wellTypeState } from '../../store/wellType';
import { ModuleCompareDropdown } from '../moduleCompareDropdown';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const ChartSettings: FC = memo(() => {
    const { t } = useTranslation();

    const charworks = useRecoilValue(charworksSelector);
    const compareParam = useRecoilValue(chartCompareState);
    const plasts = useRecoilValue(modulePlasts);

    const [chartType, setChartType] = useRecoilState(chartTypeState);
    const [dataMode, setDataMode] = useRecoilState(dataModeState);
    const [dataModelType, setDataModelType] = useRecoilState(dataModelTypeState);
    const [modeMapType, setModeMapType] = useRecoilState(modeMapTypeState);
    const [plastId, setPlastId] = useRecoilState(currentPlastId);
    const [showRepairs, setShowRepairs] = useRecoilState(showRepairsState);
    const [wellType, setWellType] = useRecoilState(wellTypeState);

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
                    {!isCompareChart && (
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
                            ) : (
                                <FormControl variant='inline'>
                                    <FormLabel>{i18n.t(dict.common.data)}:</FormLabel>
                                    <Dropdown
                                        options={[
                                            new DropdownOption(
                                                DataModeEnum.SummaryO,
                                                i18n.t(dict.optimization.allScenarios)
                                            ),
                                            new DropdownOption(
                                                DataModeEnum.BestMainO,
                                                i18n.t(dict.optimization.bestScenario)
                                            )
                                        ]}
                                        value={dataMode}
                                        onChange={e => setDataMode(+e.target.value)}
                                    />
                                </FormControl>
                            )}
                            {dataMode === DataModeEnum.SummaryO && (
                                <FormControl variant='inline'>
                                    <FormLabel>{i18n.t(dict.common.charWork)}:</FormLabel>

                                    {charworks.length > 1 ? (
                                        <Dropdown
                                            options={map(x => new DropdownOption(x, getCharworkName(x)), charworks)}
                                            value={wellType}
                                            onChange={e => setWellType(+e.target.value)}
                                        />
                                    ) : (
                                        <span>&nbsp;{getCharworkName(charworks[0])}</span>
                                    )}
                                </FormControl>
                            )}
                        </>
                    )}
                    {!isCompareChart && (
                        <FormControl variant='inline'>
                            <FormLabel>{i18n.t(dict.common.mode)}:</FormLabel>
                            <Dropdown
                                value={modeMapType}
                                options={[
                                    new DropdownOption(ModeMapEnum.Daily, i18n.t(dict.common.daily)),
                                    new DropdownOption(ModeMapEnum.Accumulated, i18n.t(dict.common.accumulated))
                                ]}
                                onChange={e => setModeMapType(+e.target.value)}
                            />
                        </FormControl>
                    )}
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

const getCharworkName = (x: WellTypeEnum) =>
    x === WellTypeEnum.Oil
        ? i18n.t(dict.common.oilWell)
        : x === WellTypeEnum.Injection
        ? i18n.t(dict.common.injWell)
        : '';
