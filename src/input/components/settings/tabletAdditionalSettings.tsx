import React, { FC, useState } from 'react';

import { FormControl, FormLabel } from '@chakra-ui/react';
import { tabletScaleState } from 'common/store/tabletScale';
import { indentState } from 'input/store/tablet/indent';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { Dropdown } from '../../../common/components/dropdown/dropdown';
import { InputElement } from '../../../common/components/inputElement';
import { tabletScaleOptions } from '../../../common/components/tabletWrapper/legend';
import { shallow } from '../../../common/helpers/ramda';
import { TabletSettingsModel } from '../../entities/tabletSettingsModel';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface IProps {
    model: TabletSettingsModel;
    onChange: (model: TabletSettingsModel) => void;
}

export const TabletAdditionalSettings: FC<IProps> = (p: IProps) => {
    const { t } = useTranslation();

    const [scale, setScale] = useRecoilState(tabletScaleState);

    return (
        <>
            <FormControl variant='inline'>
                <FormLabel>{t(dict.tablet.ratio)}:</FormLabel>
                <Dropdown
                    options={tabletScaleOptions()}
                    value={p.model.scale}
                    onChange={e => {
                        p.onChange(
                            shallow(p.model, {
                                scale: +e.target.value
                            })
                        );
                        setScale(+e.target.value);
                    }}
                />
            </FormControl>
            {/* <FormControl variant='inline'>
                <FormLabel>{t(dict.tablet.indent)}:</FormLabel>
                <InputElement value={indent} type='number' min={0} step={10} onChange={value => setIndent(+value)} />
            </FormControl> */}
        </>
    );
};
