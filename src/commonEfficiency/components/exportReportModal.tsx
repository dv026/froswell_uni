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
import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import { GtmTypeEnum } from 'commonEfficiency/enums/gtmTypeEnum';
import { ScenarioDropdown } from 'proxy/components/scenarioDropdown';
import { map, prepend } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { ScenarioModel } from '../../calculation/entities/scenarioModel';
import { isLoadingExportState } from '../../calculation/store/isLoadingExport';
import { ExcelReportIcon } from '../../common/components/customIcon/actions';
import { Dropdown, DropdownOption } from '../../common/components/dropdown/dropdown';
import { FormField } from '../../common/components/formField';
import { Info } from '../../common/components/info/info';
import { tryParse } from '../../common/helpers/number';
import { isNullOrEmpty, shallow } from '../../common/helpers/ramda';
import { ReportExportModel } from '../entities/exportModel';
import { modulePlasts } from '../store/currentPlastId';

import dict from '../../common/helpers/i18n/dictionary/main.json';

interface ExportReportModalProps {
    model: ReportExportModel;
    scenarios?: ScenarioModel[];
    export: (model: ReportExportModel) => void;
}

export const ExportReportModal: FC<ExportReportModalProps> = (p: ExportReportModalProps) => {
    const { t } = useTranslation();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const isLoading = useRecoilValue(isLoadingExportState);
    const plasts = useRecoilValue(modulePlasts);

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
        p.export(model.evaluationType === EvaluationTypeEnum.Standart ? shallow(model, { plastId: null }) : model);
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
                        {isNullOrEmpty(p.scenarios) ? null : (
                            <FormField title={t(dict.common.scenario)}>
                                <ScenarioDropdown
                                    scenarioId={model.scenarioId}
                                    scenarios={p.scenarios}
                                    onChange={id => setModel(shallow(model, { scenarioId: id }))}
                                />
                                <Info tip={t(dict.proxy.selectionScenario)} />
                            </FormField>
                        )}
                        {model.evaluationType === EvaluationTypeEnum.Insim ? (
                            <FormField title={t(dict.common.currentPlast)}>
                                <Dropdown
                                    options={prepend(
                                        new DropdownOption(null, t(dict.common.dataBy.object)),
                                        map(p => new DropdownOption(p.id, p.name), plasts)
                                    )}
                                    value={model.plastId}
                                    onChange={e => setModel(shallow(model, { plastId: tryParse(e.target.value) }))}
                                />
                            </FormField>
                        ) : null}
                        <FormField title={t(dict.efficiency.settings.repairType)}>
                            <Dropdown
                                options={[
                                    new DropdownOption(GtmTypeEnum.ByWell, t(dict.efficiency.settings.repairByWell)),
                                    new DropdownOption(
                                        GtmTypeEnum.ByNeighborWells,
                                        t(dict.efficiency.settings.repairByNeighborWells)
                                    )
                                ]}
                                value={model.gtmType}
                                onChange={e => setModel(shallow(model, { gtmType: +e.target.value }))}
                            />
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
