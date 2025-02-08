import React, { FC, memo } from 'react';

import { Box, Checkbox, Flex, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import { any, filter, includes, join, map, prepend } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { TabletViewSetting } from '../../../../calculation/components/tablet/tabletViewSetting';
import { currentPlastId } from '../../../../calculation/store/currentPlastId';
import { Dropdown, DropdownOption } from '../../../../common/components/dropdown/dropdown';
import { ChartCompareEnum } from '../../../../common/enums/chartCompareEnum';
import { DisplayModeEnum } from '../../../../common/enums/displayModeEnum';
import { tryParse } from '../../../../common/helpers/number';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { NeighborINSIM, WellINSIM } from '../../../entities/insim/well';
import { currentSpot } from '../../../store/well';
import { creationOpts, creationOptsByObject, GraphViewParam } from '../enums/graphViewParam';
import { chartCompareState } from '../store/chartCompare';
import { displayModeState } from '../store/displayMode';
import { availableGridsSelector, mapSettingsSelector, mapSettingsState } from '../store/mapSettings';
import { relativePermeabilitySelector, reportState } from '../store/report';
import { showRepairsState } from '../store/showRepairs';
import { viewTypeSelector } from '../store/viewType';
import { сurrentParamIdState } from '../store/сurrentParamId';
import { ChartSelectorDropdown } from './chartSelectorDropdown';
import { CalculationGridModal } from './modal/calculationGridModal';
import { ModeMapDropdown } from './modeMapDropdown';
import { ModuleCompareDropdown } from './moduleCompareDropdown';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const Settings: FC = memo(() => {
    const { t } = useTranslation();

    const compareParam = useRecoilValue(chartCompareState);
    const displayMode = useRecoilValue(displayModeState);
    const relativePermeability = useRecoilValue(relativePermeabilitySelector);
    const report = useRecoilValue(reportState);
    const well = useRecoilValue(currentSpot);

    const [currentParamId, setCurrentParamId] = useRecoilState(сurrentParamIdState);
    const [plastId, setPlastId] = useRecoilState(currentPlastId);
    const [showRepairs, setShowRepairs] = useRecoilState(showRepairsState);
    const [viewType, setViewType] = useRecoilState(viewTypeSelector);

    const resetMapSettings = useResetRecoilState(mapSettingsState);

    if (!report) {
        return null;
    }

    const wellName = well.id ? well.id.toString() : null; // todo mb
    const chartsData = report?.insim?.adaptations ?? [];
    const neighbors = isNullOrEmpty(chartsData) ? [] : chartsData[0].defaultNeighbors();

    const isChart = displayMode === DisplayModeEnum.Chart;
    const isMap = displayMode === DisplayModeEnum.Map;
    const isTablet = displayMode === DisplayModeEnum.TabletNew;

    const isCompareChart = compareParam !== ChartCompareEnum.Sum;

    return (
        <Box className='actions-panel' w='100%'>
            <Flex>
                <HStack spacing={4}>
                    {isChart && (
                        <>
                            {!isCompareChart && (
                                <>
                                    <FormControl variant='inline'>
                                        <FormLabel>{t(dict.common.type)}:</FormLabel>
                                        <Dropdown
                                            onChange={e => setViewType(e.target.value as GraphViewParam)}
                                            options={well.id ? creationOpts() : creationOptsByObject()}
                                            value={viewType}
                                        />
                                    </FormControl>
                                    {includes(GraphViewParam.RelativePermeability, currentParamId) ? null : (
                                        <ModeMapDropdown />
                                    )}
                                </>
                            )}
                            <FormControl variant='inline'>
                                <ChartSelectorDropdown
                                    currentId={currentParamId}
                                    neighborInfos={report.neighbors}
                                    neighbors={neighbors}
                                    saturationNeighbors={saturationNeighbors(report.insim, neighbors)}
                                    onClick={setCurrentParamId}
                                    plasts={report.plasts}
                                    wellName={wellName}
                                />
                            </FormControl>
                            {includes(GraphViewParam.Common, currentParamId) && <ModuleCompareDropdown />}
                            {includes(GraphViewParam.RelativePermeability, currentParamId) ? (
                                <FormControl variant='inline'>
                                    <FormLabel>Регион скважин:</FormLabel>
                                    <FormLabel
                                        fontWeight='bold'
                                        maxWidth='200px'
                                        textOverflow='ellipsis'
                                        overflow='hidden'
                                        whiteSpace='nowrap'
                                    >
                                        {join(
                                            ', ',
                                            map(it => it, relativePermeability.names)
                                        )}
                                    </FormLabel>
                                </FormControl>
                            ) : (
                                <FormControl variant='inline'>
                                    <FormLabel>{t(dict.common.showPepairs)}:</FormLabel>
                                    <Checkbox
                                        isChecked={showRepairs}
                                        onChange={e => setShowRepairs(e.target.checked)}
                                    />
                                </FormControl>
                            )}
                        </>
                    )}
                    {isMap ? (
                        <>
                            <FormControl variant='inline'>
                                <FormLabel>{t(dict.common.currentPlast)}:</FormLabel>
                                <Dropdown
                                    className='action__selector'
                                    options={prepend(
                                        new DropdownOption(null, t(dict.common.dataBy.object)),
                                        map(p => new DropdownOption(p.id, p.name), report.plasts)
                                    )}
                                    value={plastId}
                                    onChange={e => {
                                        setPlastId(tryParse(e.target.value));
                                        resetMapSettings();
                                    }}
                                />
                            </FormControl>
                            <ModeMapDropdown />
                            <CalculationGridModal />
                        </>
                    ) : null}
                    {isTablet ? <TabletViewSetting /> : null}
                </HStack>
            </Flex>
        </Box>
    );
});

const saturationNeighbors = (well: WellINSIM, neighbors: NeighborINSIM[]) =>
    filter(
        x => any(y => x.wellId === y.neighborWellId && x.plastId === y.plastId, well?.frontTracking?.neighbors || []),
        neighbors || []
    );
