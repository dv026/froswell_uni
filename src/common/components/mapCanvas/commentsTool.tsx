import React, { FC } from 'react';

import { Box, Button, Card, CardBody, CardFooter, CardHeader, Flex, Heading, Text } from '@chakra-ui/react';
import { WellCommentModel } from 'common/entities/mapCanvas/wellCommentModel';
import { ddmmyyyy } from 'common/helpers/date';
import { capitalizeFirstLetter } from 'common/helpers/strings';
import { wellCommentsSelector } from 'common/store/wellComments';
import { currentSpot } from 'input/store/well';
import { map } from 'ramda';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';
import { useRecoilValue } from 'recoil';

import colors from '../../../../theme/colors';
import { AddCommentModal } from './modal/addCommentModal';
import { DownloadFileModal } from './modal/downloadFileModal';
import { RemoveCommentModal } from './modal/removeCommentModal';

import cssTools from '../tools/tools.module.less';
import css from './map.module.less';

import dict from '../../helpers/i18n/dictionary/main.json';

export const CommentsTool = () => {
    const { t } = useTranslation();

    const well = useRecoilValue(currentSpot);

    const comments = useRecoilValue(wellCommentsSelector);

    const isActiveWell = !!well.id;

    const getTitle = (it: WellCommentModel) =>
        [ddmmyyyy(new Date(it.dt)), isActiveWell ? null : it.wellName, capitalizeFirstLetter(it.author)]
            .filter(x => !!x)
            .join(', ');

    return (
        <Flex gap={2} direction='column'>
            <Heading>{t(dict.map.comments.commentsByWell)}</Heading>
            {map(
                it => (
                    <Card>
                        <CardBody width={'250px'} padding={4}>
                            <Flex direction={'column'} gap={1}>
                                <Flex justify={'space-between'}>
                                    <Text fontSize={'12px'} color={colors.typo.secondary}>
                                        {getTitle(it)}
                                    </Text>
                                    <Flex gap={2}>
                                        {it.fileName && <DownloadFileModal id={it.id} fileName={it.fileName} />}
                                        <RemoveCommentModal id={it.id} />
                                    </Flex>
                                </Flex>
                                <Text>{it.comment}</Text>
                            </Flex>
                        </CardBody>
                    </Card>
                ),
                comments
            )}
            {isActiveWell && <AddCommentModal />}
            <ReactTooltip id='well-comments-tooltip' effect='solid' />
        </Flex>
    );
};
