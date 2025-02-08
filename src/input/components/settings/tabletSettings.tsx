import React, { FC } from 'react';

import { FormControl, FormLabel } from '@chakra-ui/react';
import i18n from 'i18next';
import { useWellMutations } from 'input/store/wellMutations';
import { all, ifElse, isNil, map, pipe, prepend, reject } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Dropdown, DropdownOption } from '../../../common/components/dropdown/dropdown';
import { KeyValue } from '../../../common/entities/keyValue';
import { WellBrief } from '../../../common/entities/wellBrief';
import { DisplayModeEnum } from '../../../common/enums/displayModeEnum';
import { isTruthy, nul } from '../../../common/helpers/ramda';
import { currentSpot } from '../../../input/store/well';
import { objectsSelector } from '../../../input/store/wells';
import { TabletModeType } from '../../enums/tabletModeType';
import { displayModeState } from '../../store/displayMode';
import { tabletSettingsState } from '../../store/tablet/tablet';
import { tabletDisplayModeState } from '../../store/tablet/tabletDisplayModeState';
import { tabletModeTypeState } from '../../store/tablet/tabletModeType';
import { TabletAdditionalSettings } from './tabletAdditionalSettings';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const TabletSettings = () => {
    const { t } = useTranslation();

    const well = useRecoilValue(currentSpot);

    const [modelSettings, setModelSettings] = useRecoilState(tabletSettingsState);

    const [tabletDisplayMode, setTabletDisplayMode] = useRecoilState(tabletDisplayModeState);
    const [mode, setMode] = useRecoilState(tabletModeTypeState);

    const objects = useRecoilValue(objectsSelector(well.id));

    const wellMutation = useWellMutations();

    return (
        <>
            <FormControl variant='inline'>
                <FormLabel>{t(dict.common.mode)}:</FormLabel>
                <Dropdown
                    options={[
                        new DropdownOption(DisplayModeEnum.TabletNew, t(dict.common.tablet)),
                        new DropdownOption(DisplayModeEnum.Table, t(dict.proxy.table)),
                        new DropdownOption(
                            DisplayModeEnum.TabletPlusTable,
                            `${t(dict.common.tablet)}+${t(dict.proxy.table)}`
                        )
                    ]}
                    value={tabletDisplayMode}
                    onChange={e => {
                        setTabletDisplayMode(+e.target.value as DisplayModeEnum);
                    }}
                />
            </FormControl>
            {well.id ? (
                <FormControl variant='inline'>
                    <FormLabel>{t(dict.common.object)}:</FormLabel>
                    <Dropdown
                        options={objectOptions(objects)}
                        value={well.prodObjId}
                        onChange={e => {
                            wellMutation.set(
                                new WellBrief(
                                    well.oilFieldId,
                                    well.id,
                                    +e.target.value ? +e.target.value : null,
                                    well.charWorkId
                                )
                            );
                        }}
                    />
                </FormControl>
            ) : (
                <FormControl variant='inline'>
                    <FormLabel>{t(dict.common.mode)}:</FormLabel>
                    <Dropdown
                        options={[
                            new DropdownOption(TabletModeType.Plasts, t(dict.common.plasts)),
                            new DropdownOption(TabletModeType.Wells, t(dict.common.wells))
                        ]}
                        value={mode}
                        onChange={e => {
                            setMode(+e.target.value as TabletModeType);
                        }}
                    />
                </FormControl>
            )}
            <TabletAdditionalSettings model={modelSettings} onChange={setModelSettings} />
        </>
    );
};

const objectOptions = (objects: KeyValue[]): DropdownOption[] =>
    pipe(map(optionFromKeyValue), reject(isNil), prepend(new DropdownOption('null', i18n.t(dict.common.all))))(objects);

const optionFromKeyValue = (raw: KeyValue): DropdownOption | null =>
    ifElse(
        (x: KeyValue) => all(isTruthy)([x, x.id, x.name]),
        (x: KeyValue) => new DropdownOption(x.id, x.name),
        nul
    )(raw);
