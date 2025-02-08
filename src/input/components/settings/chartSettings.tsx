import React from 'react';

import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react';
import i18n from 'i18next';
import { useWellMutations } from 'input/store/wellMutations';
import { filter, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Dropdown, DropdownOption, optsFromKeyValues } from '../../../common/components/dropdown/dropdown';
import { WellBrief } from '../../../common/entities/wellBrief';
import { DataTypeEnum } from '../../../common/enums/dataTypeEnum';
import { DisplayModeEnum } from '../../../common/enums/displayModeEnum';
import { ModeTypeEnum } from '../../../common/enums/modeType';
import { tryParse } from '../../../common/helpers/number';
import { isNullOrEmpty } from '../../../common/helpers/ramda';
import { objectsSelector, wellListState } from '../../../input/store/wells';
import { showRepairsState } from '../../store/chart/showRepairs';
import { dataTypeState } from '../../store/dataType';
import { displayModeState } from '../../store/displayMode';
import { modeTypeState } from '../../store/modeType';
import { selectedWellsState } from '../../store/selectedWells';
import { currentSpot } from '../../store/well';
import { wellTypesSelector } from '../../store/wells';
import { optionsFromKeyValues } from './mapSettings';
import { ModuleCompareDropdown } from './moduleCompareDropdown';
import { ModuleCompareSyncMode } from './moduleCompareSyncMode';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const ChartSettings = () => {
    const { t } = useTranslation();

    const wells = useRecoilValue(wellListState);
    const displayMode = useRecoilValue(displayModeState);
    const wellTypes = useRecoilValue(wellTypesSelector);
    const well = useRecoilValue(currentSpot);

    const [dataType, setDataType] = useRecoilState(dataTypeState);
    const [modeType, setModeType] = useRecoilState(modeTypeState);
    const [showRepairs, setShowRepairs] = useRecoilState(showRepairsState);
    const [selectedWells, setSelectedWells] = useRecoilState(selectedWellsState);

    const objects = useRecoilValue(objectsSelector(well?.id));

    const wellMutation = useWellMutations();

    if (displayMode !== DisplayModeEnum.Chart) {
        return null;
    }

    const isMer = dataType === DataTypeEnum.Mer;
    const multipleSelection = !isNullOrEmpty(selectedWells);
    const multipleObjects = !isNullOrEmpty(objects);
    const multipleWellTypes = !isNullOrEmpty(wellTypes);

    return (
        <>
            <FormControl variant='inline'>
                <FormLabel>{t(dict.common.data)}:</FormLabel>
                <Dropdown
                    options={[
                        new DropdownOption(DataTypeEnum.Mer, i18n.t(dict.input.mer))

                        // TODO: временно закомментировано
                        // new DropdownOption(DataTypeEnum.Daily, i18n.t(dict.input.gridResults)),
                        // new DropdownOption(DataTypeEnum.MerPlusDaily, i18n.t(dict.input.merPlusGridResults))
                    ]}
                    value={dataType}
                    onChange={e => {
                        setDataType(+e.target.value);
                    }}
                />
            </FormControl>
            <FormControl variant='inline'>
                <FormLabel>{t(dict.common.mode)}:</FormLabel>
                <Dropdown
                    options={[
                        new DropdownOption(ModeTypeEnum.Daily, i18n.t(dict.common.daily)),
                        new DropdownOption(ModeTypeEnum.Monthly, i18n.t(dict.common.monthly)),
                        new DropdownOption(ModeTypeEnum.Accumulated, i18n.t(dict.common.accumulated))
                    ]}
                    value={modeType}
                    onChange={e => {
                        setModeType(+e.target.value);
                    }}
                />
            </FormControl>
            {multipleObjects && (
                <FormControl variant='inline'>
                    <FormLabel>{t(dict.common.object)}:</FormLabel>
                    <Dropdown
                        options={optionsFromKeyValues(objects, true)}
                        value={well.prodObjId}
                        onChange={e => {
                            if (tryParse(e.target.value)) {
                                setSelectedWells([]);
                            } else {
                                const selected = filter(
                                    it => it.oilFieldId === well.oilFieldId && it.id === well.id,
                                    wells
                                );

                                setSelectedWells(
                                    map(
                                        it => new WellBrief(it.oilFieldId, it.id, it.productionObjectId, it.charWorkId),
                                        selected
                                    )
                                );
                            }

                            wellMutation.set(
                                new WellBrief(well.oilFieldId, well.id, tryParse(e.target.value), well.charWorkId)
                            );
                        }}
                    />
                </FormControl>
            )}
            {multipleWellTypes && !multipleSelection && (
                <FormControl variant='inline'>
                    <FormLabel>{t(dict.common.fund)}:</FormLabel>
                    <Dropdown
                        options={optsFromKeyValues(wellTypes)}
                        value={well.charWorkId}
                        onChange={e => {
                            wellMutation.set(new WellBrief(well.oilFieldId, well.id, well.prodObjId, +e.target.value));
                        }}
                    />
                </FormControl>
            )}
            <ModuleCompareDropdown />
            {isMer && (
                <FormControl variant='inline'>
                    <FormLabel>{t(dict.common.showPepairs)}:</FormLabel>
                    <Checkbox isChecked={showRepairs} onChange={e => setShowRepairs(e.target.checked)} />
                </FormControl>
            )}
            <ModuleCompareSyncMode />
        </>
    );
};
