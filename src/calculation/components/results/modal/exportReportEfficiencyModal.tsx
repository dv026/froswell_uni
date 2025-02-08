import React, { FC, useEffect } from 'react';
import { useState } from 'react';

import {
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    ButtonGroup
} from '@chakra-ui/react';
import { PlastModel } from 'common/entities/plastModel';
import { map, prepend } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { ExcelReportIcon } from '../../../../common/components/customIcon/actions';
import { Dropdown, DropdownOption } from '../../../../common/components/dropdown/dropdown';
import { FormField } from '../../../../common/components/formField';
import { Info } from '../../../../common/components/info/info';
import { tryParse } from '../../../../common/helpers/number';
import { shallow } from '../../../../common/helpers/ramda';
import { ReportExportEfficiencyModel } from '../../../../prediction/subModules/results/entities/exportEfficiencyModel';
import { ScenarioModel } from '../../../entities/scenarioModel';
import { isLoadingExportState } from '../../../store/isLoadingExport';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface ExportReportModalProps {
    model: ReportExportEfficiencyModel;
    plasts: PlastModel[];
    scenarios: ScenarioModel[];
    isProxy?: boolean;
    export: (model: ReportExportEfficiencyModel) => void;
}

export const ExportReportEfficiencyModal: FC<ExportReportModalProps> = (p: ExportReportModalProps) => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const isLoading = useRecoilValue(isLoadingExportState);

    const [model, setModel] = useState(p.model);

    useEffect(() => {
        setModel(p.model);
    }, [p.model]);

    const handleOpenClick = () => {
        onOpen();
    };

    const handleClose = () => {
        onClose();
    };

    const submit = () => {
        p.export(model);
    };

    return (
        <>
            <Button
                onClick={handleOpenClick}
                position='absolute'
                bottom='0'
                right='0'
                padding='0 20px'
                leftIcon={<ExcelReportIcon boxSize={5} color='icons.grey' />}
                variant='unstyled'
            >
                {t(dict.common.report.generate)}
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.common.report.create)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormField title={t(dict.common.currentPlast)}>
                            <Dropdown
                                className='action__selector'
                                options={prepend(
                                    new DropdownOption(null, t(dict.common.all)),
                                    map(p => new DropdownOption(p.id, p.name), p.plasts)
                                )}
                                value={model.plastId}
                                onChange={e => setModel(shallow(model, { plastId: tryParse(e.target.value) }))}
                            />
                            <Info tip={t(dict.common.currentPlast)} />
                        </FormField>
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' isLoading={isLoading} onClick={submit}>
                                {t(dict.common.report.exportXlsx)}
                            </Button>
                            <Button onClick={handleClose} variant='cancel'>
                                {t(dict.common.cancel)}
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
