/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useState } from 'react';

import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    FormControl,
    FormLabel,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useDisclosure
} from '@chakra-ui/react';
import { ExcelReportIcon } from 'common/components/customIcon/actions';
import { getWellCommentFile } from 'common/gateway';
import { downloadFile } from 'common/helpers/file';
import { head } from 'ramda';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { round1 } from '../../../helpers/math';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { ExcelIcon } from '../../customIcon/general';

import dict from '../../../helpers/i18n/dictionary/main.json';

interface Props {
    id: number;
    fileName: string;
}

export const DownloadFileModal = (p: Props) => {
    const { t } = useTranslation();

    const submit = async () => {
        const response = await getWellCommentFile(p.id);

        downloadFile(response);
    };

    return (
        <>
            <Button
                onClick={submit}
                data-tip={p.fileName}
                data-for={'well-comments-tooltip'}
                textAlign='center'
                variant='unstyled'
                minW={'15px'}
                height={'auto'}
            >
                <ExcelReportIcon boxSize={4} />
            </Button>
        </>
    );
};
