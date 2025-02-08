import React, { FC, memo } from 'react';

import { Box, Button, HStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { OpenIcon, SaveIcon } from '../../../common/components/customIcon/actions';
import { SettingsIcon } from '../../../common/components/customIcon/general';
import { Dropdown, DropdownOption } from '../../../common/components/dropdown/dropdown';
import { isNullOrEmpty, shallow } from '../../../common/helpers/ramda';
import { selectedWellsState } from '../../../input/store/selectedWells';
import { MethodEnum } from '../../enums/methodEnum';
import { saveKalman } from '../../gateways';
import { isLoadingState } from '../../store/isLoading';
import { kalmanParamsState, showToolState } from '../../store/kalmanParams';
import { kalmanSavedResultState } from '../../store/kalmanSavedResult';
import { showSavedResultState } from '../../store/showSavedResult';
import { currentSpot } from '../../store/well';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const Settings: FC = memo(() => {
    const { t } = useTranslation();

    const well = useRecoilValue(currentSpot);
    const selectedWells = useRecoilValue(selectedWellsState);

    const [params, setParams] = useRecoilState(kalmanParamsState);
    const [showSavedResult, setShowSavedResult] = useRecoilState(showSavedResultState);
    const [showTool, setShowTool] = useRecoilState(showToolState);

    const setIsLoading = useSetRecoilState(isLoadingState);

    const refreshSavedResult = useRecoilRefresher_UNSTABLE(kalmanSavedResultState);

    const showSavedChecked = well.id ? showSavedResult : false;

    const onSavedResult = async () => {
        setShowSavedResult(!showSavedChecked);

        refreshSavedResult();
    };

    const onSave = async () => {
        setIsLoading(true);

        const wells = isNullOrEmpty(selectedWells) ? [well] : selectedWells;

        await saveKalman(wells, params);

        setShowSavedResult(false);

        setIsLoading(false);
    };

    return (
        <Box className='actions-panel'>
            <HStack spacing={4}>
                <Button
                    iconSpacing={0}
                    isActive={showTool}
                    leftIcon={<SettingsIcon boxSize={7} />}
                    p={0}
                    w='35px'
                    h='35px'
                    variant={showTool ? 'solid' : 'callWindow'}
                    onClick={() => setShowTool(prev => !prev)}
                />
                <Dropdown
                    className='filtration__param'
                    onChange={e => setParams(shallow(params, { method: e.target.value as MethodEnum }))}
                    options={[
                        new DropdownOption(MethodEnum.Kalman, t(dict.filtration.method.kalman)),
                        new DropdownOption(MethodEnum.Slide, t(dict.filtration.method.slide))
                    ]}
                    value={params.method}
                />
                <Button leftIcon={<SaveIcon boxSize={4} />} variant='primary' onClick={onSave}>
                    {t(dict.filtration.saveCalculation)}
                </Button>
                <Button
                    leftIcon={<OpenIcon boxSize={4} />}
                    variant='unstyled'
                    isDisabled={!well.id}
                    onClick={onSavedResult}
                >
                    {showSavedChecked ? t(dict.common.close) : t(dict.filtration.openSavedCalculation)}
                </Button>
            </HStack>
        </Box>
    );
});
