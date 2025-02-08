/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useState } from 'react';

import {
    AlertStatus,
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    CloseButton,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { addWellComments } from 'common/gateway';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { wellCommentsSelector } from 'common/store/wellComments';
import { fi } from 'date-fns/locale';
import { loginName } from 'identity/helpers/authHelper';
import { historyDateState } from 'input/store/map/historyDate';
import { useModuleMapMutations } from 'input/store/map/moduleMapMutations';
import { currentPlastId } from 'input/store/plast';
import { currentSpot } from 'input/store/well';
import { head, last } from 'ramda';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilValue } from 'recoil';

import { round1 } from '../../../helpers/math';

import dict from '../../../helpers/i18n/dictionary/main.json';

const limitSize = 10000000; // 10mb
const allowedFileTypes = ['xsl', 'xlsx', 'csv', 'doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'zip', 'tif'];

export const AddCommentModal = () => {
    const { t } = useTranslation();

    const toast = useToast();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const historyDate = useRecoilValue(historyDateState);
    const well = useRecoilValue(currentSpot);

    const dispatcher = useModuleMapMutations();

    const commentsRefresher = useRecoilRefresher_UNSTABLE(wellCommentsSelector);

    const [commentText, setCommentText] = useState('');
    const [myFiles, setMyFiles] = useState([]);

    const onDrop = useCallback(
        acceptedFiles => {
            if (isNullOrEmpty(acceptedFiles)) {
                return;
            }

            const file = head<any>(acceptedFiles);

            if (file.size > limitSize || !allowedFileTypes.includes(last(file.name.split('.')))) {
                let status: AlertStatus = 'error';

                toast({
                    title: t(dict.common.error),
                    description: t(dict.map.comments.validationMessage),
                    status: status,
                    duration: 5000,
                    isClosable: true
                });

                return;
            }

            setMyFiles([...myFiles, ...acceptedFiles]);
        },
        [myFiles]
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop
    });

    const removeAll = () => {
        setMyFiles([]);
    };

    const submit = async () => {
        const data = new FormData();
        data.append('file', head(myFiles));

        await addWellComments({
            oilFieldId: well.oilFieldId,
            productionObjectId: well.prodObjId,
            wellId: well.id,
            comment: commentText,
            author: loginName(),
            file: isNullOrEmpty(myFiles) ? null : data
        });

        onClose();

        setCommentText('');
        removeAll();

        dispatcher.reload(historyDate);

        await commentsRefresher();
    };

    const files = myFiles.map((file: any) => (
        <p key={file.path}>
            {file.path} - {round1(file.size / 1000)} KB
        </p>
    ));

    const isLoadFile = !isNullOrEmpty(files) || commentText;

    return (
        <>
            <Button onClick={onOpen} justifyContent={'start'} variant='link' fontSize='12px'>
                {t(dict.map.comments.add)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size={'lg'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.map.comments.add)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={2}>
                            <FormLabel>{t(dict.map.comments.one)}</FormLabel>
                            <Textarea
                                autoFocus
                                value={commentText}
                                placeholder={t(dict.map.comments.placeholder)}
                                onChange={e => setCommentText(e.target.value.substring(0, 255))}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>File</FormLabel>
                            <Box className='container' padding={4} border='1px grey dashed' cursor={'pointer'}>
                                {isNullOrEmpty(files) ? (
                                    <div {...getRootProps({ className: 'dropzone' })}>
                                        <input {...getInputProps()} />
                                        <p>{t(dict.load.howToUploadTip)}</p>
                                    </div>
                                ) : (
                                    <HStack>
                                        <Text>{files}</Text>
                                        <CloseButton onClick={removeAll} />
                                    </HStack>
                                )}
                            </Box>
                            <FormLabel fontSize={'sm'} textAlign='right' mr={0}>
                                {t(dict.load.formatLoadedData)}: {allowedFileTypes.join(', ')}
                            </FormLabel>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' onClick={submit} isDisabled={!isLoadFile}>
                                {t(dict.common.add)}
                            </Button>
                            <Button onClick={onClose} variant='cancel'>
                                {t(dict.common.cancel)}
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
