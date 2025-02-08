/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useState } from 'react';

import {
    Button,
    ButtonGroup,
    Checkbox,
    FormControl,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure
} from '@chakra-ui/react';
import { head } from 'ramda';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { ExcelIcon } from '../../../../common/components/customIcon/general';
import { round1 } from '../../../../common/helpers/math';
import { isNullOrEmpty } from '../../../../common/helpers/ramda';
import { UploadCommonProps } from '../../../entities/uploadCommonProps';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const LoadExcelModal: FC<UploadCommonProps> = (p: UploadCommonProps) => {
    const { t } = useTranslation();

    const [clearData, setClearData] = useState<boolean>(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

    const submit = () => {
        const data = new FormData();
        data.append('file', head(acceptedFiles));

        p.upload(data, clearData);

        onClose();
    };

    const files = acceptedFiles.map((file: any) => (
        <p key={file.path}>
            {file.path} - {round1(file.size / 1000)} KB
        </p>
    ));

    const isLoadFile = !isNullOrEmpty(files);

    return (
        <>
            <Button
                onClick={onOpen}
                leftIcon={<ExcelIcon color='icons.grey' boxSize={6} />}
                variant='link'
                fontSize='12px'
            >
                {t(dict.load.uploadNew)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size={'lg'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{p.title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontWeight='bold' mb='1rem'>
                            {t(dict.load.formatLoadedData)}: xsl, xlsx, csv
                        </Text>
                        <section className='container'>
                            <div {...getRootProps({ className: 'dropzone' })}>
                                <input {...getInputProps()} />
                                <p>{t(dict.load.howToUploadTip)}</p>
                            </div>
                            {isLoadFile ? <Text p={4}>{files}</Text> : null}
                        </section>
                        <FormControl p='10px 0'>
                            <Checkbox isChecked={clearData} onChange={e => setClearData(e.target.checked)}>
                                {t(dict.load.clearData)}
                            </Checkbox>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' onClick={submit} isDisabled={!isLoadFile}>
                                {t(dict.load.loadData)}
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

// const CustomToast = (error: string, totalRowCount: number) => {
//     let title = t(mainDict.load.downloadResults);
//     let message = t('load.totalLinesParam', { value: totalRowCount });
//     let status: any = 'success';

//     if (error) {
//         title = t(mainDict.common.error);
//         message = error;
//         status = 'error';
//     }

//     toast({
//         title: title,
//         description: message,
//         status: status,
//         duration: 5000,
//         isClosable: true
//     });
// };
