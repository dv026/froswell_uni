import React from 'react';
import { FC } from 'react';

import { Flex } from '@chakra-ui/react';
import i18n from 'i18next';

import { ActionLinks as BaseActionLinks } from '../../../common/components/actionLinks';
import { Breadcrumb } from '../breadcrumb';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const ActionLinks = () => {
    return (
        <Flex alignItems='center'>
            <BaseActionLinks moduleName={i18n.t(dict.stairway.prediction)} links={[]} />
            <Breadcrumb />
        </Flex>
    );
};
