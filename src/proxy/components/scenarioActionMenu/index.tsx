import React from 'react';

import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { currentScenarioId } from 'calculation/store/currentScenarioId';
import { scenariosState } from 'calculation/store/scenarios';
import { FavoriteIcon, MoreIcon } from 'common/components/customIcon/general';
import i18n from 'i18next';
import { CopyScenarioModal } from 'proxy/subModules/model/components/modal/copyScenarioModal';
import { DeleteScenarioModal } from 'proxy/subModules/model/components/modal/deleteScenarioModal';
import { RenameScenarioModal } from 'proxy/subModules/model/components/modal/renameScenarioModal';
import { useScenarioMutations } from 'proxy/subModules/model/store/scenarioMutations';
import { find, isNil } from 'ramda';
import { useRecoilValue } from 'recoil';

import colors from '../../../../theme/colors';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const ScenarioActionMenu = () => {
    const scenarios = useRecoilValue(scenariosState);
    const scenarioId = useRecoilValue(currentScenarioId);

    const dispatcher = useScenarioMutations();

    const scenarioItem = find(it => it.id === scenarioId, scenarios);

    if (isNil(scenarioItem)) {
        return null;
    }

    return (
        <Menu>
            <MenuButton as={Button} variant='unstyled'>
                <MoreIcon boxSize={6} />
            </MenuButton>
            <MenuList>
                <MenuItem>
                    <CopyScenarioModal />
                </MenuItem>
                <MenuItem>
                    <RenameScenarioModal />
                </MenuItem>
                <MenuItem>
                    <DeleteScenarioModal />
                </MenuItem>
                <MenuItem>
                    <Button
                        variant={'unstyled'}
                        leftIcon={
                            <FavoriteIcon
                                boxSize={5}
                                color={scenarioItem.favorite ? colors.colors.yellow : colors.bg.black}
                            />
                        }
                        onClick={() => dispatcher.favoriteItem(scenarioId)}
                    >
                        {i18n.t(dict.common.favorite)}
                    </Button>
                </MenuItem>
            </MenuList>
        </Menu>
    );
};
