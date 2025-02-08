import React, { FC } from 'react';

import {
    Button,
    ButtonGroup,
    Checkbox,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spacer,
    useDisclosure
} from '@chakra-ui/react';
import { isNil } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { adaptationsNumberParam, insimCalcParams } from '../../../../../calculation/store/insimCalcParams';
import { useInsimMutations } from '../../../../../calculation/store/insimMutations';
import { FormField } from '../../../../../common/components/formField';
import { Info } from '../../../../../common/components/info/info';
import { InputNumber } from '../../../../../common/components/inputNumber';
import { SingleField } from '../../../../../common/components/singleField';
import { shallow } from '../../../../../common/helpers/ramda';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const ContinueImprovementModal = () => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [params, setParams] = useRecoilState(insimCalcParams);
    const [adaptations, setAdaptations] = useRecoilState(adaptationsNumberParam);

    const dispatcher = useInsimMutations();

    if (isNil(params)) {
        return null;
    }

    const handleSubmit = () => {
        dispatcher.startAdaptationImprovement();
        onClose();
    };

    return (
        <>
            <Button variant='cancel' onClick={onOpen}>
                {t(dict.calculation.continueImprovement)}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size='lg'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.calculation.calculationParams)}</ModalHeader>
                    <ModalBody>
                        <FormField title={t(dict.proxy.adaptationsNumber)} ratio={[70, 30]}>
                            <InputNumber w='100px' min={1} value={adaptations} onChange={val => setAdaptations(+val)} />
                            <Info tip={t(dict.proxy.adaptationsNumber)} />
                        </FormField>
                        <FormField title={`${t(dict.proxy.deviationTransmissibilities)}, %`}>
                            <InputNumber
                                w='100px'
                                value={params.transmissibilitiesLimit}
                                onChange={val => setParams(shallow(params, { transmissibilitiesLimit: +val }))}
                            />
                            <Info tip={t(dict.proxy.deviationTransmissibilities)} />
                        </FormField>
                        <FormField title={`${t(dict.proxy.deviationPreVolume)}, %`}>
                            <InputNumber
                                w='100px'
                                value={params.preVolumeLimit}
                                onChange={val => setParams(shallow(params, { preVolumeLimit: +val }))}
                            />
                            <Info tip={t(dict.proxy.deviationPreVolume)} />
                        </FormField>
                        <SingleField>
                            <Checkbox
                                isChecked={params.saveOnlyBestA}
                                onChange={e => setParams(shallow(params, { saveOnlyBestA: e.target.checked }))}
                            >
                                {t(dict.proxy.saveOnlyBestA)}
                            </Checkbox>
                        </SingleField>
                    </ModalBody>
                    <ModalFooter>
                        <Spacer />
                        <ButtonGroup>
                            <Button variant='primary' disabled={false} onClick={handleSubmit}>
                                {t(dict.calculation.continueImprovement)}
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
