import React from 'react';

import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { currentSubScenarioId } from 'calculation/store/currentSubScenarioId';
import { CopyIcon } from 'common/components/customIcon/actions';
import { MoreIcon } from 'common/components/customIcon/general';
import { isNullOrEmpty } from 'common/helpers/ramda';
import i18n from 'i18next';
import { useRecoilValue } from 'recoil';

import { DeleteSubScenarioModal } from '../../../prediction/subModules/model/components/modal/deleteSubScenarioModal';
import { RenameSubScenarioModal } from '../../../prediction/subModules/model/components/modal/renameSubScenarioModal';
import { useSubScenarioMutations } from '../../../prediction/subModules/model/store/subScenarioMutations';
import { allSubScenarios } from '../../../prediction/subModules/model/store/subScenarios';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const SubScenarioActionMenu = () => {
    const subScenarios = useRecoilValue(allSubScenarios);
    const subScenarioId = useRecoilValue(currentSubScenarioId);

    const dispatcher = useSubScenarioMutations();

    if (isNullOrEmpty(subScenarios)) {
        return null;
    }

    return (
        <Menu>
            <MenuButton as={Button} variant='unstyled'>
                <MoreIcon boxSize={6} />
            </MenuButton>
            <MenuList>
                <MenuItem>
                    <Button
                        variant='unstyled'
                        leftIcon={<CopyIcon boxSize={4} />}
                        onClick={() => dispatcher.copyItem(subScenarioId)}
                    >
                        {i18n.t(dict.common.copy)}
                    </Button>
                </MenuItem>
                <MenuItem>
                    <RenameSubScenarioModal />
                </MenuItem>
                <MenuItem>
                    <DeleteSubScenarioModal />
                </MenuItem>
            </MenuList>
        </Menu>
    );
};
