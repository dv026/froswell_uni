import React, { FC, useState } from 'react';

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
import i18n from 'i18next';
import { filter, flatten, head, map } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilState, useRecoilValue } from 'recoil';

import { ScenarioModel } from '../../../../../calculation/entities/scenarioModel';
import { currentPlastId } from '../../../../../calculation/store/currentPlastId';
import { currentScenarioId } from '../../../../../calculation/store/currentScenarioId';
import { selectedPolygonState } from '../../../../../calculation/store/polygon';
import { scenariosState } from '../../../../../calculation/store/scenarios';
import { Dropdown, DropdownOption } from '../../../../../common/components/dropdown/dropdown';
import { FormField } from '../../../../../common/components/formField';
import { Info } from '../../../../../common/components/info/info';
import { mapSettingsState } from '../../../../store/map/mapSettings';
import { copyAreaEditModel } from '../../gateways/gateway';
import { isLoadingEditModelState } from '../../store/isLoadingEditModel';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface CopyAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CopyAreaModal: FC<CopyAreaModalProps> = (props: CopyAreaModalProps) => {
    const { t } = useTranslation();

    const scenarioId = useRecoilValue(currentScenarioId);
    const scenarios = useRecoilValue(scenariosState);
    const plastId = useRecoilValue(currentPlastId);
    const selectedPolygon = useRecoilValue(selectedPolygonState);

    const [isLoading, setIsLoading] = useRecoilState(isLoadingEditModelState);

    const refreshMapSettings = useRecoilRefresher_UNSTABLE(mapSettingsState);

    const [allPlasts, setAllPlasts] = useState(false);
    const [sourseScenarioId, setSourseScenarioId] = useState<number>(
        head(filter(x => x.id !== scenarioId, scenarios))?.id
    );

    const submit = async () => {
        setIsLoading(true);

        await copyAreaEditModel(sourseScenarioId, scenarioId, plastId, allPlasts, selectedPolygon);

        setIsLoading(false);

        props.onClose();

        refreshMapSettings();
    };

    return (
        <Modal isOpen={props.isOpen} size='lg' onClose={props.onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t(dict.calculation.map.copyPropertiesFromAnotherModel)}</ModalHeader>
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
                        <Info tip={t(dict.calculation.scenarios.basedOnScenario)} />
                    </FormField>
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
