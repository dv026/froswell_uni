import React, { FC, useEffect, useState } from 'react';

import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalFooter,
    ButtonGroup,
    ModalBody,
    Checkbox
} from '@chakra-ui/react';
import { headOrDefault } from 'common/helpers/ramda';
import i18n from 'i18next';
import { filter, find, flatten, head, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { Dropdown, DropdownOption } from '../../../common/components/dropdown/dropdown';
import { FormField } from '../../../common/components/formField';
import { copyCharworks } from '../../../prediction/gateways/gateway';
import { SubScenarioModel } from '../../../proxy/entities/proxyMap/subScenarioModel';
import { mapSettingsState } from '../../../proxy/store/map/mapSettings';
import { ScenarioModel } from '../../entities/scenarioModel';
import { currentPlastId } from '../../store/currentPlastId';
import { currentScenarioId } from '../../store/currentScenarioId';
import { currentSubScenarioId } from '../../store/currentSubScenarioId';
import { isLoadingCopyCharworks } from '../../store/isLoadingCopyCharworks';
import { selectedPolygonState } from '../../store/polygon';
import { scenariosState } from '../../store/scenarios';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

interface CopyAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CopyCharworksModal: FC<CopyAreaModalProps> = (props: CopyAreaModalProps) => {
    const { t } = useTranslation();

    const plastId = useRecoilValue(currentPlastId);
    const scenarioId = useRecoilValue(currentScenarioId);
    const scenarios = useRecoilValue(scenariosState);
    const selectedPolygon = useRecoilValue(selectedPolygonState);
    const subScenarioId = useRecoilValue(currentSubScenarioId);

    const [isLoading, setIsLoading] = useRecoilState(isLoadingCopyCharworks);

    const resetMapSettings = useResetRecoilState(mapSettingsState);

    const refreshMapSettings = useRecoilRefresher_UNSTABLE(mapSettingsState);

    const [allPlasts, setAllPlasts] = useState(false);
    const [copyPresureZab, setCopyPresureZab] = useState(true);
    const [copySkinfactor, setCopySkinfactor] = useState(true);

    const [subScenarios, setSubScenarios] = useState<SubScenarioModel[]>([]);
    const [sourseScenarioId, setSourseScenarioId] = useState<number>(
        headOrDefault(
            null,
            filter(x => x.id !== scenarioId, scenarios)
        )?.id
    );
    const [sourceSubScenarioId, setSourceSubScenarioId] = useState<number>(
        headOrDefault(null, head(filter(x => x.id !== scenarioId, scenarios))?.subScenarios)?.id
    );

    useEffect(() => {
        setSubScenarios(find(it => it.id === sourseScenarioId, scenarios)?.subScenarios || []);
    }, [sourseScenarioId, scenarios]);

    useEffect(() => {
        setSourseScenarioId;
    }, [sourseScenarioId]);

    const submit = async () => {
        setIsLoading(true);

        await copyCharworks({
            sourceScenarioId: sourseScenarioId,
            sourceSubScenarioId: sourceSubScenarioId,
            targetScenarioId: scenarioId,
            targetSubScenarioId: subScenarioId,
            plastId: plastId,
            allPlasts: allPlasts,
            polygon: selectedPolygon,
            copyPresureZab: copyPresureZab,
            copySkinfactor: copySkinfactor
        });

        setIsLoading(false);

        props.onClose();

        resetMapSettings();
        refreshMapSettings();
    };

    return (
        <Modal isOpen={props.isOpen} size='lg' onClose={props.onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{i18n.t(dict.calculation.map.copyWellTypesFromAnotherSubScenario)}</ModalHeader>
                <ModalBody>
                    <FormField title={t(dict.calculation.scenarios.basedOnScenario)}>
                        <Dropdown
                            onChange={e => setSourseScenarioId(+e.target.value)}
                            options={flatten([
                                map(
                                    (it: ScenarioModel) => new DropdownOption(it.id, it.name),
                                    filter(x => x.id !== scenarioId, scenarios)
                                )
                            ])}
                            value={sourseScenarioId}
                        />
                    </FormField>
                    <FormField title={t(dict.proxy.selectionSubscenario)}>
                        <Dropdown
                            onChange={e => setSourceSubScenarioId(+e.target.value)}
                            options={flatten([
                                map((it: SubScenarioModel) => new DropdownOption(it.id, it.name), subScenarios)
                            ])}
                            value={sourceSubScenarioId}
                        />
                    </FormField>
                    <Checkbox isChecked={copyPresureZab} onChange={e => setCopyPresureZab(e.target.checked)}>
                        {i18n.t(dict.calculation.map.copyBottomholePressures)}
                    </Checkbox>
                    <Checkbox isChecked={copySkinfactor} onChange={e => setCopySkinfactor(e.target.checked)}>
                        {i18n.t(dict.calculation.map.copySkinFactors)}
                    </Checkbox>
                    <Checkbox isChecked={allPlasts} onChange={e => setAllPlasts(e.target.checked)}>
                        {t(dict.proxy.addToAllPlasts)}
                    </Checkbox>
                </ModalBody>
                <ModalCloseButton />
                <ModalFooter>
                    <ButtonGroup>
                        <Button isLoading={isLoading} variant='primary' onClick={() => submit()}>
                            {i18n.t(dict.common.copy)}
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
