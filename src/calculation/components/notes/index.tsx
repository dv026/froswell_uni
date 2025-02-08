import React, { FC, useState } from 'react';

import { InfoIcon, QuestionIcon, WarningIcon } from '@chakra-ui/icons';
import { Box, Flex, IconProps, Modal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { stringify } from 'calculation/components/notes/targetShapers';
import { Note, NoteLevel } from 'calculation/entities/note';
import { filter, isNil, map, not } from 'ramda';
import { useTranslation } from 'react-i18next';

import colors from '../../../../theme/colors';

import mainDict from 'common/helpers/i18n/dictionary/main.json';

interface Props {
    notes: Note[];
}

export const NoteManager: FC<Props> = ({ notes }) => {
    const [showType, setShowType] = useState<NoteLevel | null>(null);

    const infos = filter(x => x.level === 1, notes ?? []);
    const warnings = filter(x => x.level === 2, notes ?? []);
    const errors = filter(x => x.level === 3, notes ?? []);

    return (
        <>
            <Flex direction='row'>
                {infos.length > 0 && (
                    <InfoIcon
                        {...defaultIconProps}
                        color={colors.icons.grey}
                        onClick={() => setShowType(NoteLevel.Info)}
                    />
                )}
                {warnings.length > 0 && (
                    <QuestionIcon
                        {...defaultIconProps}
                        color={colors.typo.yellow}
                        onClick={() => setShowType(NoteLevel.Warning)}
                    />
                )}
                {errors.length > 0 && (
                    <WarningIcon
                        {...defaultIconProps}
                        color={colors.icons.red}
                        onClick={() => setShowType(NoteLevel.Error)}
                    />
                )}
            </Flex>

            <Modal isOpen={not(isNil(showType))} onClose={() => setShowType(null)} scrollBehavior='inside' size='3xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalBody>
                        <Notes notes={getNotes(showType, infos, warnings, errors)} />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

const getNotes = (showType: NoteLevel | null, infos: Note[], warnings: Note[], errors: Note[]): Note[] => {
    switch (showType) {
        case NoteLevel.Info:
            return infos;
        case NoteLevel.Warning:
            return warnings;
        case NoteLevel.Error:
            return errors;
        default:
            return [];
    }
};

const defaultIconProps: Partial<IconProps> = {
    cursor: 'pointer',
    boxSize: 6,
    margin: 1,
    _hover: {
        transform: 'scale(1.1)',
        transformOrigin: 'center'
    }
};

const Notes: FC<Props> = ({ notes }) => (
    <>
        {map(
            note => (
                <NoteLine key={stringify(note.target)} note={note} />
            ),
            notes
        )}
    </>
);

const NoteLine: FC<{ note: Note }> = ({ note }) => {
    const { t } = useTranslation();

    return (
        <Box>
            <Box fontSize='1.1rem' fontWeight='bolder'>
                {stringify(note.target)}
            </Box>
            <Box marginLeft='20px'>
                {t(mainDict.calculation.notes[note.code.toString()])}
                <span>{note.message ? ':' : ''}</span> <span style={{ fontStyle: 'italic' }}>{note.message ?? ''}</span>
            </Box>
        </Box>
    );
};
