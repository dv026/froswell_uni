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
    ButtonGroup,
    Checkbox
} from '@chakra-ui/react';
import { PlastModel } from 'common/entities/plastModel';
import { find, map, prepend } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { ExcelReportIcon } from '../../../../common/components/customIcon/actions';
import { Dropdown, DropdownOption } from '../../../../common/components/dropdown/dropdown';
import { FormField } from '../../../../common/components/formField';
import { Info } from '../../../../common/components/info/info';
import { SingleField } from '../../../../common/components/singleField';
import { tryParse } from '../../../../common/helpers/number';
import { isNullOrEmpty, shallow } from '../../../../common/helpers/ramda';
import { SubScenarioDropdown } from '../../../../prediction/subModules/model/components/subScenarioDropdown';
import { ReportDataTypeEnum, ReportExportModel } from '../../../../prediction/subModules/results/entities/exportModel';
import { ScenarioDropdown } from '../../../../proxy/components/scenarioDropdown';
import { ScenarioModel } from '../../../entities/scenarioModel';
import { isLoadingExportState } from '../../../store/isLoadingExport';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface ExportReportModalProps {
    model: ReportExportModel;
    plasts: PlastModel[];
    scenarios: ScenarioModel[];
    isProxy?: boolean;
    export: (model: ReportExportModel) => void;
}

export const ExportReportModal: FC<ExportReportModalProps> = (p: ExportReportModalProps) => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const isLoading = useRecoilValue(isLoadingExportState);

    const [model, setModel] = useState(p.model);

    useEffect(() => {
        setModel(p.model);
    }, [p.model]);

    const subScenarios = find(it => it.id === model.scenarioId, p.scenarios)?.subScenarios ?? [];

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
                        <FormField title={t(dict.common.scenario)}>
                            <ScenarioDropdown
                                scenarioId={model.scenarioId}
                                scenarios={p.scenarios}
                                onChange={id => setModel(shallow(model, { scenarioId: id }))}
                            />
                            <Info tip={t(dict.proxy.selectionScenario)} />
                        </FormField>
                        {isNullOrEmpty(subScenarios) || p.isProxy ? null : (
                            <FormField title={t(dict.common.subScenario)}>
                                <SubScenarioDropdown
                                    subScenarioId={model.subScenarioId}
                                    subScenarios={subScenarios}
                                    onChange={id => setModel(shallow(model, { subScenarioId: id }))}
                                />
                                <Info tip={t(dict.common.subScenario)} />
                            </FormField>
                        )}
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
                        {p.isProxy ? null : (
                            <FormField title={t(dict.common.report.dataSource)}>
                                <Dropdown
                                    value={model.dataType}
                                    options={[
                                        new DropdownOption(
                                            ReportDataTypeEnum.Adaptation,
                                            t(dict.common.report.adaptation)
                                        ),
                                        new DropdownOption(
                                            ReportDataTypeEnum.Prediction,
                                            t(dict.common.report.prediction)
                                        ),
                                        new DropdownOption(
                                            ReportDataTypeEnum.AdaptationPlusPrediction,
                                            t(dict.common.report.adaptationPrediction)
                                        )
                                    ]}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                        setModel(shallow(model, { dataType: +e.target.value }))
                                    }
                                />
                                <Info tip={t(dict.common.report.dataSource)} />
                            </FormField>
                        )}
                        <SingleField>
                            <Checkbox
                                isChecked={model.onlyInLicenseBorder}
                                onChange={e => setModel(shallow(model, { onlyInLicenseBorder: e.target.checked }))}
                            >
                                {t(dict.common.report.insideLicense)}
                            </Checkbox>
                        </SingleField>
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
