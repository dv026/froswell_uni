import React, { FC, useCallback, useEffect, useState } from 'react';

import {
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ButtonGroup,
    ModalBody
} from '@chakra-ui/react';
import i18n from 'i18next';
import { filter, find, flatten, head, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilValue } from 'recoil';

import { ScenarioModel } from '../../../../../calculation/entities/scenarioModel';
import { currentScenarioId } from '../../../../../calculation/store/currentScenarioId';
import { currentSubScenarioId } from '../../../../../calculation/store/currentSubScenarioId';
import { scenariosState } from '../../../../../calculation/store/scenarios';
import { Dropdown, DropdownOption } from '../../../../../common/components/dropdown/dropdown';
import { FormField } from '../../../../../common/components/formField';
import { SubScenarioModel } from '../../../../../proxy/entities/proxyMap/subScenarioModel';
import { copyLimits } from '../../../limits/gateways/gateway';
import { moduleState } from '../../store/moduleState';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const CopyLimitsModal = () => {
    const { t } = useTranslation();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const scenarioId = useRecoilValue(currentScenarioId);
    const subScenarioId = useRecoilValue(currentSubScenarioId);
    const scenarios = useRecoilValue(scenariosState);

    const refreshLimits = useRecoilRefresher_UNSTABLE(moduleState);

    const [subScenarios, setSubScenarios] = useState<SubScenarioModel[]>([]);
    const [sourceSubScenarioId, setSourceSubScenarioId] = useState<number>();
    const [sourseScenarioId, setSourseScenarioId] = useState<number>(
        head(filter(x => x.id !== subScenarioId, scenarios))?.id
    );

    useEffect(() => {
        const items = find(it => it.id === sourseScenarioId, scenarios)?.subScenarios || [];
        setSourceSubScenarioId(head(filter(it => it.id !== subScenarioId, items))?.id);
        setSubScenarios(items);
    }, [scenarioId, scenarios, sourseScenarioId, subScenarioId]);

    const submit = useCallback(async () => {
        await copyLimits({ sourceSubScenarioId: sourceSubScenarioId, targetSubScenarioId: subScenarioId });
        refreshLimits();
        onClose();
    }, [onClose, refreshLimits, sourceSubScenarioId, subScenarioId]);

    return (
        <>
            <Button onClick={onOpen} variant='primary'>
                {i18n.t(dict.calculation.map.copyLimits)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{i18n.t(dict.calculation.map.copyLimits)}</ModalHeader>
                    <ModalBody>
                        <FormField title={t(dict.calculation.scenarios.basedOnScenario)}>
                            <Dropdown
                                onChange={e => setSourseScenarioId(+e.target.value)}
                                options={flatten([
                                    map((it: ScenarioModel) => new DropdownOption(it.id, it.name), scenarios)
                                ])}
                                value={sourseScenarioId}
                            />
                        </FormField>
                        <FormField title={t(dict.proxy.selectionSubscenario)}>
                            <Dropdown
                                onChange={e => setSourceSubScenarioId(+e.target.value)}
                                options={flatten([
                                    map(
                                        (it: SubScenarioModel) => new DropdownOption(it.id, it.name),
                                        filter(x => x.id !== sourseScenarioId, subScenarios)
                                    )
                                ])}
                                value={sourceSubScenarioId}
                            />
                        </FormField>
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button variant='primary' onClick={submit}>
                                {i18n.t(dict.common.copy)}
                            </Button>
                            <Button variant='cancel' onClick={onClose}>
                                {i18n.t(dict.common.cancel)}
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
