import React from 'react';

import { FormControl, FormLabel } from '@chakra-ui/react';
import i18n from 'i18next';
import { DistributionType } from 'input/enums/distributionType';
import { distributionTypeState } from 'input/store/map/distributionType';
import { useWellMutations } from 'input/store/wellMutations';
import { all, ifElse, isNil, map, pipe, prepend, reject } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { Dropdown, DropdownOption } from '../../../common/components/dropdown/dropdown';
import { KeyValue } from '../../../common/entities/keyValue';
import { WellBrief } from '../../../common/entities/wellBrief';
import { DataTypeEnum } from '../../../common/enums/dataTypeEnum';
import { DisplayModeEnum } from '../../../common/enums/displayModeEnum';
import { ModeMapEnum } from '../../../common/enums/modeMapEnum';
import { tryParse } from '../../../common/helpers/number';
import { isNullOrEmpty, isTruthy, nul } from '../../../common/helpers/ramda';
import { dataTypeState } from '../../../input/store/dataType';
import { currentPlastId } from '../../../input/store/plast';
import { plastListState } from '../../../input/store/plasts';
import { currentSpot } from '../../../input/store/well';
import { objectsSelector } from '../../../input/store/wells';
import { displayModeState } from '../../store/displayMode';
import { historyDateState } from '../../store/map/historyDate';
import { modeMapTypeState } from '../../store/map/modeMapType';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const MapSettings = () => {
    const { t } = useTranslation();

    const displayMode = useRecoilValue(displayModeState);
    const plasts = useRecoilValue(plastListState);
    const well = useRecoilValue(currentSpot);

    const [dataType, setDataType] = useRecoilState(dataTypeState);
    const [distributionType, setDistributionType] = useRecoilState(distributionTypeState);
    const [modeMapType, setModeMapType] = useRecoilState(modeMapTypeState);
    const [plastId, setPlastId] = useRecoilState(currentPlastId);

    const setHistoryDate = useSetRecoilState(historyDateState);

    const objects = useRecoilValue(objectsSelector(well.id));

    const wellMutation = useWellMutations();

    if (displayMode !== DisplayModeEnum.Map) {
        return null;
    }

    return (
        <>
            <FormControl variant='inline'>
                <FormLabel>{t(dict.common.data)}:</FormLabel>
                <Dropdown
                    options={[
                        new DropdownOption(DataTypeEnum.Mer, i18n.t(dict.input.mer))

                        // TODO: временно закомментировано
                        // new DropdownOption(DataTypeEnum.Daily, i18n.t(dict.input.gridResults))
                    ]}
                    value={dataType}
                    onChange={e => {
                        setDataType(+e.target.value);
                        //points: null
                        setHistoryDate(null);
                    }}
                />
            </FormControl>
            <FormControl variant='inline'>
                <FormLabel>{t(dict.common.mode)}:</FormLabel>
                <Dropdown
                    options={[
                        new DropdownOption(ModeMapEnum.Daily, t(dict.common.daily)),
                        new DropdownOption(ModeMapEnum.Accumulated, t(dict.common.accumulated))
                    ]}
                    value={modeMapType}
                    onChange={e => {
                        setModeMapType(+e.target.value);
                    }}
                />
            </FormControl>
            {isNullOrEmpty(objects) ? null : (
                <FormControl variant='inline'>
                    <FormLabel>{t(dict.common.object)}:</FormLabel>
                    <Dropdown
                        options={optionsFromKeyValues(objects, false)}
                        value={well.prodObjId}
                        onChange={e => {
                            wellMutation.set(new WellBrief(well.oilFieldId, well.id, +e.target.value, well.charWorkId));
                        }}
                    />
                </FormControl>
            )}
            {isNullOrEmpty(plasts) ? null : (
                <FormControl variant='inline'>
                    <FormLabel>{t(dict.common.plast)}:</FormLabel>
                    <Dropdown
                        options={optionsFromKeyValues(plasts, true)}
                        value={plastId}
                        onChange={e => {
                            setPlastId(tryParse(e.target.value));
                        }}
                    />
                </FormControl>
            )}
            <FormControl variant='inline'>
                <FormLabel>{t(dict.common.distribution)}:</FormLabel>
                <Dropdown
                    options={[
                        new DropdownOption(DistributionType.Rigis, t(dict.common.distributionBy.rigis)),
                        new DropdownOption(DistributionType.Research, t(dict.common.distributionBy.research))
                    ]}
                    value={distributionType}
                    onChange={e => {
                        setDistributionType(+e.target.value);
                    }}
                />
            </FormControl>
        </>
    );
};

export const optionsFromKeyValues = (values: KeyValue[], addAll: boolean = false): DropdownOption[] =>
    pipe(map(optionFromKeyValue), reject(isNil), (opts: DropdownOption[]): DropdownOption[] =>
        opts.length > 1 && addAll ? prepend(new DropdownOption('null', i18n.t(dict.common.all)), opts) : opts
    )(values);

const optionFromKeyValue = (raw: KeyValue): DropdownOption =>
    ifElse(
        (x: KeyValue) => all(isTruthy)([x, x.id, x.name]),
        x => new DropdownOption(x.id, x.name),
        nul
    )(raw);
