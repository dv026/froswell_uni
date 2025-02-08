import React from 'react';

import {
    Box,
    Button,
    ButtonGroup,
    Flex,
    Text,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody
} from '@chakra-ui/react';
import { HomeIcon, ReloadIcon } from 'common/components/customIcon/general';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import colors from '../../../../theme/colors';
import { RouteEnum } from '../../enums/routeEnum';

import css from './index.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

interface IProps {
    error: Error;
}

export function ErrorBoundaryFallbackComponent({ error }: IProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [show, setShow] = React.useState(false);

    const handleToggle = () => setShow(!show);

    return (
        <Flex className={css.alert}>
            <Box className={css.container}>
                <Box className={css.containerBorder}>
                    <Box className={css.icon}></Box>
                    <Box>{t(dict.errorBoundary.title)}</Box>
                    <Popover>
                        <PopoverTrigger>
                            <Button variant='link' size='sm' onClick={handleToggle}>
                                {t(dict.errorBoundary.moreOnError)}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent width={'600px'}>
                            <PopoverArrow />
                            <PopoverCloseButton zIndex={1} />
                            <PopoverHeader>{error.name}</PopoverHeader>
                            <PopoverBody>
                                <Text py={2}>{error.message}</Text>
                                <Text>{error.stack}</Text>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                    <ButtonGroup className={css.buttons} variant='link' spacing={6}>
                        <Button
                            leftIcon={<ReloadIcon boxSize={6} color={colors.colors.grey} />}
                            onClick={() => window.location.reload()}
                        >
                            {t(dict.errorBoundary.reloadPage)}
                        </Button>
                        <Button
                            leftIcon={<HomeIcon boxSize={6} color={colors.colors.grey} />}
                            onClick={() => {
                                navigate(RouteEnum.Input);
                                window.location.reload();
                            }}
                        >
                            {t(dict.errorBoundary.returnToHomePage)}
                        </Button>
                    </ButtonGroup>
                </Box>
            </Box>
        </Flex>
    );
}
