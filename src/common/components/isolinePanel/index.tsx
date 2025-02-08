import React, { FC, useEffect } from 'react';

import { Button, ButtonGroup, Collapse, Divider, Spacer } from '@chakra-ui/react';
import { isNil } from 'ramda';
import { useTranslation } from 'react-i18next';

import { IsolineModel } from '../../entities/mapCanvas/isolineModel';
import { shallow } from '../../helpers/ramda';
import { FormField } from '../formField';
import { InputNumber } from '../inputNumber';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    model: IsolineModel;
    divider?: boolean;
    onChange: (model: IsolineModel) => void;
}

export const IsolinePanel: FC<Props> = (p: Props) => {
    const { t } = useTranslation();

    const [model, setModel] = React.useState(p.model);
    const [show, setShow] = React.useState(false);

    useEffect(() => {
        setModel(p.model);
    }, [p.model]);

    if (isNil(p.model)) {
        return null;
    }

    const handleToggle = () => setShow(!show);

    const onChange = () => {
        p.onChange(model);
    };

    return (
        <>
            {p.divider ? <Divider /> : null}
            <Collapse startingHeight={0} in={show}>
                <FormField title={t(dict.common.step)}>
                    <InputNumber
                        size='sm'
                        value={p.model.step}
                        onChange={val => setModel(shallow(model, { step: +val }))}
                    />
                </FormField>
                <FormField title={t(dict.common.min)}>
                    <InputNumber
                        size='sm'
                        value={p.model.min}
                        onChange={val => setModel(shallow(model, { min: +val }))}
                    />
                </FormField>
                <FormField title={t(dict.common.max)}>
                    <InputNumber
                        size='sm'
                        value={p.model.max}
                        onChange={val => setModel(shallow(model, { max: +val }))}
                    />
                </FormField>
            </Collapse>
            <ButtonGroup display='flex'>
                <Button variant='link' size='sm' onClick={handleToggle}>
                    {show ? t(dict.common.close) : t(dict.map.isolineSettings)}
                </Button>
                <Spacer />
                {show ? (
                    <Button variant='primary' size='sm' onClick={onChange}>
                        {t(dict.common.apply)}
                    </Button>
                ) : null}
            </ButtonGroup>
        </>
    );
};
