import React, { FC, memo } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
    Box,
    Center,
    Flex,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    Spacer
} from '@chakra-ui/react';
import i18n from 'i18next';
import { useNavigate } from 'react-router-dom';

import { clearAuth, loginName } from '../../../identity/helpers/authHelper';
import { RouteEnum } from '../../enums/routeEnum';
import { LanguageEnum } from '../../helpers/i18n/languageEnum';
import { cls } from '../../helpers/styles';
import { UserAvatarIcon } from '../customIcon/navigation';

import css from './index.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

export const UserInfo: FC = memo(() => {
    const navigate = useNavigate();

    const language = i18n.language === LanguageEnum.RU ? 'RU' : 'EN';

    const changeLanguage = (lng: string) => () => {
        i18n.changeLanguage(lng);
        window.location.reload();
    };

    return (
        <Menu placement='right' closeOnBlur={true} closeOnSelect={false}>
            {({ isOpen }) => (
                <>
                    <div className={cls(css.userInfo, isOpen && css.userInfo_selected)}>
                        <Center>
                            <MenuButton>
                                <Box>
                                    <UserAvatarIcon boxSize={9} />
                                </Box>
                                <Box p='6px' textTransform='capitalize'>
                                    {loginName()}
                                </Box>
                            </MenuButton>
                            <MenuList color='typo.primary'>
                                <MenuItem pt={0} pb={0} pr={1}>
                                    <Menu defaultIsOpen={false} placement='right'>
                                        <MenuButton w={'100%'}>
                                            <Flex alignItems='center'>
                                                <Box>Язык ({language})</Box>
                                                <Spacer />
                                                <Box>
                                                    <ChevronRightIcon color='icons.grey' boxSize={7} />
                                                </Box>
                                            </Flex>
                                        </MenuButton>
                                        <MenuList minWidth='120px'>
                                            <MenuOptionGroup defaultValue={i18n.language} type='radio'>
                                                <MenuItemOption
                                                    value={LanguageEnum.RU}
                                                    onClick={changeLanguage(LanguageEnum.RU)}
                                                >
                                                    Русский
                                                </MenuItemOption>
                                                <MenuItemOption
                                                    value={LanguageEnum.EN}
                                                    onClick={changeLanguage(LanguageEnum.EN)}
                                                >
                                                    English
                                                </MenuItemOption>
                                            </MenuOptionGroup>
                                        </MenuList>
                                    </Menu>
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem
                                    onClick={() => {
                                        clearAuth();
                                        navigate(RouteEnum.Login);
                                    }}
                                >
                                    {i18n.t(dict.stairway.logoff)}
                                </MenuItem>
                            </MenuList>
                        </Center>
                    </div>
                </>
            )}
        </Menu>
    );
});
