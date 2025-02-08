import React from 'react';

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
import { DeleteIcon } from 'common/components/customIcon/actions';
import { MapScaleIcon } from 'common/components/customIcon/map';
import { Dropdown, DropdownOption } from 'common/components/dropdown/dropdown';
import { removeWellComments } from 'common/gateway';
import { round0 } from 'common/helpers/math';
import { tryParse } from 'common/helpers/number';
import { mapScaleState } from 'common/store/mapScale';
import { wellCommentsSelector } from 'common/store/wellComments';
import { historyDateState } from 'input/store/map/historyDate';
import { useModuleMapMutations } from 'input/store/map/moduleMapMutations';
import { map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilState, useRecoilValue } from 'recoil';

import dict from '../../../helpers/i18n/dictionary/main.json';

const values = [0.1, 0.25, 0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 2, 3];

interface Props {}

export const MapScaleModal = (p: Props) => {
    const { t } = useTranslation();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [scale, setScale] = useRecoilState(mapScaleState);

    const submit = async () => {
        onClose();
    };

    return (
        <>
            <Button onClick={onOpen} textAlign='center' variant='unstyled' minW={'15px'} height={'auto'}>
                <MapScaleIcon boxSize={6} />
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size={'sm'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.map.scale)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={2}>
                            <Dropdown
                                className='action__selector'
                                options={map(it => new DropdownOption(it, `${round0(it * 100)}%`), values)}
                                value={scale}
                                onChange={e => setScale(+e.target.value)}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' onClick={submit}>
                                {t(dict.common.save)}
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
