import React from 'react';

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    useDisclosure
} from '@chakra-ui/react';
import { DeleteIcon } from 'common/components/customIcon/actions';
import { removeWellComments } from 'common/gateway';
import { wellCommentsSelector } from 'common/store/wellComments';
import { historyDateState } from 'input/store/map/historyDate';
import { useModuleMapMutations } from 'input/store/map/moduleMapMutations';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilValue } from 'recoil';

import dict from '../../../helpers/i18n/dictionary/main.json';

interface Props {
    id: number;
}

export const RemoveCommentModal = (p: Props) => {
    const { t } = useTranslation();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef();

    const historyDate = useRecoilValue(historyDateState);

    const dispatcher = useModuleMapMutations();

    const commentsRefresher = useRecoilRefresher_UNSTABLE(wellCommentsSelector);

    const submit = async () => {
        await removeWellComments(p.id);

        onClose();

        dispatcher.reload(historyDate);

        await commentsRefresher();
    };

    return (
        <>
            <Button onClick={onOpen} textAlign='center' variant='unstyled' minW={'15px'} height={'auto'}>
                <DeleteIcon boxSize={4} />
            </Button>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            {t(dict.map.comments.delete)}
                        </AlertDialogHeader>

                        <AlertDialogBody>{t(dict.map.comments.deleteConfirm)}</AlertDialogBody>

                        <AlertDialogFooter>
                            <Button variant={'cancel'} ref={cancelRef} onClick={onClose}>
                                {t(dict.common.cancel)}
                            </Button>
                            <Button colorScheme='red' onClick={submit} ml={3}>
                                {t(dict.common.remove)}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};
