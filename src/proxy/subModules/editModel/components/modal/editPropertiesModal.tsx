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
    Text,
    Checkbox,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel
} from '@chakra-ui/react';
import i18n from 'i18next';
import inside from 'point-in-polygon';
import { filter, map, mean } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { currentPlastId } from '../../../../../calculation/store/currentPlastId';
import { currentScenarioId } from '../../../../../calculation/store/currentScenarioId';
import { selectedPolygonState } from '../../../../../calculation/store/polygon';
import { FormField } from '../../../../../common/components/formField';
import { InputNumber } from '../../../../../common/components/inputNumber';
import { SingleField } from '../../../../../common/components/singleField';
import { round2 } from '../../../../../common/helpers/math';
import { isNullOrEmpty, shallow } from '../../../../../common/helpers/ramda';
import { saveAdaptationEditModel } from '../../gateways/gateway';
import { adaptationEditModelState, useRefetchAdaptationEditModel } from '../../store/adaptationEditModel';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface PropertyItem {
    avgVolume: number;
    avgTransmissibility: number;
    prevolumeMultiplier: number;
    transmissibilityMultiplier: number;
}

interface EditPropertiesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EditPropertiesModal: FC<EditPropertiesModalProps> = (props: EditPropertiesModalProps) => {
    const { t } = useTranslation();

    const scenarioId = useRecoilValue(currentScenarioId);
    const plastId = useRecoilValue(currentPlastId);
    const properties = useRecoilValue(adaptationEditModelState);
    const selectedPolygon = useRecoilValue(selectedPolygonState);

    const [model, setModel] = useState<PropertyItem>(null);
    const [allPlasts, setAllPlasts] = useState(false);

    const refetchAdaptationWellGroup = useRefetchAdaptationEditModel();

    useEffect(() => {
        if (isNullOrEmpty(selectedPolygon)) {
            return;
        }

        const wellsInPolygon = filter(
            it =>
                inside(
                    [it.xWell, it.yWell],
                    map(n => [n.x, n.y], selectedPolygon)
                ),
            properties
        );

        setModel({
            avgVolume: round2(mean(map(it => it.volume, wellsInPolygon))) || 0,
            avgTransmissibility: round2(mean(map(it => it.transmissibility, wellsInPolygon))) || 0,
            prevolumeMultiplier: round2(mean(map(it => it.prevolumeMultiplier, wellsInPolygon))) || 1,
            transmissibilityMultiplier: round2(mean(map(it => it.transmissibilityMultiplier, wellsInPolygon))) || 1
        });
    }, [properties, selectedPolygon]);

    const submit = async () => {
        props.onClose();

        await saveAdaptationEditModel(
            scenarioId,
            plastId,
            model.prevolumeMultiplier,
            model.transmissibilityMultiplier,
            allPlasts,
            selectedPolygon
        );

        refetchAdaptationWellGroup();
    };

    if (!model) {
        return null;
    }

    return (
        <Modal isOpen={props.isOpen} size='lg' onClose={props.onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Изменения свойств скважин</ModalHeader>
                <ModalBody>
                    <Tabs isLazy>
                        <TabList>
                            <Tab>Межскваженный объем</Tab>
                            <Tab>{i18n.t(dict.common.params.transmissibility)}</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <SingleField>
                                    <Text>Среднее значение объема - {round2(model.avgVolume)} м³</Text>
                                </SingleField>
                                <SingleField>
                                    <Checkbox isChecked={allPlasts} onChange={e => setAllPlasts(e.target.checked)}>
                                        {t(dict.proxy.addToAllPlasts)}
                                    </Checkbox>
                                </SingleField>
                                <SingleField>
                                    <FormField title={'Множитель'}>
                                        <InputNumber
                                            value={model.prevolumeMultiplier}
                                            step={0.1}
                                            min={-100}
                                            max={100}
                                            w={'100px'}
                                            onChange={value =>
                                                setModel(shallow(model, { prevolumeMultiplier: +value }))
                                            }
                                        />
                                    </FormField>
                                </SingleField>
                            </TabPanel>
                            <TabPanel>
                                <SingleField>
                                    <Text>
                                        Среднее значение проводимости - {round2(model.avgTransmissibility)} м³/(сут*МПа)
                                    </Text>
                                </SingleField>
                                <SingleField>
                                    <Checkbox isChecked={allPlasts} onChange={e => setAllPlasts(e.target.checked)}>
                                        {t(dict.proxy.addToAllPlasts)}
                                    </Checkbox>
                                </SingleField>
                                <SingleField>
                                    <FormField title={'Множитель'}>
                                        <InputNumber
                                            value={model.transmissibilityMultiplier}
                                            step={0.1}
                                            min={-100}
                                            max={100}
                                            w={'100px'}
                                            onChange={value =>
                                                setModel(shallow(model, { transmissibilityMultiplier: +value }))
                                            }
                                        />
                                    </FormField>
                                </SingleField>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
                <ModalCloseButton />
                <ModalFooter>
                    <ButtonGroup>
                        <Button variant='primary' onClick={() => submit()}>
                            {i18n.t(dict.common.apply)}
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
