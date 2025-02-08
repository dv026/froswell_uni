import React, { FC } from 'react';

import { Checkbox, CheckboxGroup, Stack } from '@chakra-ui/react';
import { insimCalcParams } from 'calculation/store/insimCalcParams';
import { FormField } from 'common/components/formField';
import { useRecoilState } from 'recoil';

import { shallow } from '../../../../../common/helpers/ramda';

interface Props {
    disabled?: boolean;
}

export const EngineSelector: FC<Props> = ({ disabled = false }) => {
    const [params, setParams] = useRecoilState(insimCalcParams);

    const updateEngineType = (checked: boolean, type: number) =>
        checked && setParams(shallow(params, { engineType: type }));

    return (
        <FormField title='Engine' disabled={disabled}>
            <CheckboxGroup isDisabled={disabled}>
                <Stack spacing={[1, 5]} direction={['column', 'row']}>
                    <Checkbox isChecked={params.engineType === 1} onChange={e => updateEngineType(e.target.checked, 1)}>
                        CPU
                    </Checkbox>
                    <Checkbox isChecked={params.engineType === 2} onChange={e => updateEngineType(e.target.checked, 2)}>
                        GPU
                    </Checkbox>
                </Stack>
            </CheckboxGroup>
        </FormField>
    );
};
