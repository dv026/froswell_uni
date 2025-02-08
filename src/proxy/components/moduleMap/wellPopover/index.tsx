import React, { FC, Suspense, useEffect, useState } from 'react';

import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    Divider,
    Editable,
    EditableInput,
    EditablePreview,
    Flex,
    Heading,
    HStack,
    IconButton,
    InputGroup,
    InputLeftAddon,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    Spinner,
    useEditableControls,
    Wrap,
    WrapItem
} from '@chakra-ui/react';
import { PopoverTrigger as OrigPopoverTrigger } from '@chakra-ui/react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import colors from '../../../../../theme/colors';
import { EditIcon } from '../../../../common/components/customIcon/general';
import { InputNumber } from '../../../../common/components/inputNumber';
import { SingleField } from '../../../../common/components/singleField';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { tryParse } from '../../../../common/helpers/number';
import { isNullOrEmpty, shallow } from '../../../../common/helpers/ramda';
import { ImaginaryCharWorkHistory, WellPoint } from '../../../entities/proxyMap/wellPoint';
import { sort } from '../../../helpers/charworkManager';
import { useProxyMapMutations } from '../../../store/map/proxyMapMutations';
import { wellById } from '../../../store/well';
import { addImaginaryModeState } from '../../../subModules/wellGrid/store/addImaginaryMode';
import { Charworks } from './charworks/charwork';
import { OptimizationParams } from './optimizationParams';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const PopoverTrigger: React.FC<{ children: React.ReactNode }> = OrigPopoverTrigger;

export enum CloseCommandWellPopover {
    AddHorizontalBarrel,
    RemoveHorizontalBarrel,
    SaveVirtualWell
}

interface WellPopoverProps {
    wellId: number;
    wellType: WellTypeEnum;
    offsetX: number;
    offsetY: number;
    isOpen?: boolean;
    show?: boolean;
    isPrediction?: boolean;
    isOptimization?: boolean;
    onSumbit?: () => void;
    onClose: (commandType?: CloseCommandWellPopover) => void;
}

export const WellPopover: FC<WellPopoverProps> = (p: WellPopoverProps) => {
    const { t } = useTranslation();

    const well = useRecoilValue(wellById(p.wellId));

    const [allPlastMode, setAllPlastMode] = useRecoilState(addImaginaryModeState);

    const dispatcher = useProxyMapMutations();

    const [model, setModel] = useState<WellPoint>(well);
    const [tabIndex, setTabIndex] = useState<number>(null);

    useEffect(() => {
        setModel(well);
        setTabIndex(0);
    }, [well]);

    if (!p.show || !model) {
        return null;
    }

    let typeHistories = sort(model.typeHistory);
    if (isNullOrEmpty(typeHistories)) {
        typeHistories.push(new ImaginaryCharWorkHistory());
    }

    const existHorizontalBarrel = !!model && !!model.x2 && !!model.y2;

    const isPrediction = p.isPrediction && p.show;
    const isOptimization = p.isOptimization && p.show;

    const saveVirtualWell = async () => {
        dispatcher.updateVirtualWell(well, model, isPrediction || isOptimization);

        p.onClose();
    };

    const removeVirtualWell = () => {
        dispatcher.removeVirtualWell(model.id);

        p.onClose();
    };

    const addHorizontalBarrel = () => {
        p.onClose(CloseCommandWellPopover.AddHorizontalBarrel);
    };

    const removeHorizontalBarrel = () => {
        p.onClose(CloseCommandWellPopover.RemoveHorizontalBarrel);
    };

    return (
        <Popover
            closeOnBlur={true}
            isLazy={true}
            isOpen={p.isOpen}
            onClose={p.onClose}
            placement='end'
            returnFocusOnClose={false}
        >
            <PopoverTrigger>
                <Box position='absolute' w={0} h={0} ml={p.offsetX + 10} mt={p.offsetY} />
            </PopoverTrigger>
            <PopoverContent width='420px'>
                <PopoverHeader>
                    <EditableWellName
                        name={model?.name}
                        allowEditing={model.isImaginary && !isPrediction && !isOptimization}
                        onChange={value => setModel(shallow(model, { id: value }))}
                    />
                </PopoverHeader>
                <PopoverBody>
                    <SingleField>
                        <HStack spacing={2}>
                            <InputGroup>
                                <InputLeftAddon>X</InputLeftAddon>
                                <InputNumber
                                    value={model.x}
                                    isDisabled={!model.isImaginary || isPrediction || isOptimization}
                                    onChange={value => setModel(shallow(model, { x: +value }))}
                                />
                            </InputGroup>
                            <InputGroup>
                                <InputLeftAddon>Y</InputLeftAddon>
                                <InputNumber
                                    value={model.y}
                                    isDisabled={!model.isImaginary || isPrediction || isOptimization}
                                    onChange={value => setModel(shallow(model, { y: +value }))}
                                />
                            </InputGroup>
                        </HStack>
                    </SingleField>
                    <SingleField>
                        <Charworks
                            charworks={typeHistories}
                            disabled={!isPrediction && !isOptimization}
                            onChange={(cw: ImaginaryCharWorkHistory[]) => {
                                setModel(
                                    shallow(model, {
                                        typeHistory: isNullOrEmpty(cw) ? [new ImaginaryCharWorkHistory()] : cw // todo mb
                                    })
                                );
                            }}
                        />
                    </SingleField>
                    {isPrediction || isOptimization ? (
                        <SingleField>
                            <Checkbox isChecked={allPlastMode} onChange={e => setAllPlastMode(e.target.checked)}>
                                {t(dict.proxy.addToAllPlasts)}
                            </Checkbox>
                        </SingleField>
                    ) : null}
                    <Divider />
                    {model.isImaginary && !isPrediction && !isOptimization ? (
                        <SingleField>
                            <Wrap spacing={3} width={'90%'}>
                                <WrapItem>
                                    {existHorizontalBarrel ? (
                                        <Button variant='link' onClick={removeHorizontalBarrel}>
                                            {i18n.t(dict.proxy.wellGrid.removeHorizontalFill)}
                                        </Button>
                                    ) : (
                                        <Button variant='link' onClick={addHorizontalBarrel}>
                                            {i18n.t(dict.proxy.wellGrid.addHorizontalFill)}
                                        </Button>
                                    )}
                                </WrapItem>
                                <WrapItem>
                                    <Button variant='link' onClick={removeVirtualWell}>
                                        {i18n.t(dict.proxy.wellGrid.deleteWell)}
                                    </Button>
                                </WrapItem>
                            </Wrap>
                        </SingleField>
                    ) : null}
                    {isPrediction ? (
                        <Suspense fallback={<Spinner />}>
                            <OptimizationParams
                                wellId={p.wellId}
                                typeHistories={typeHistories}
                                tabIndex={tabIndex}
                                setTabIndex={setTabIndex}
                            />
                        </Suspense>
                    ) : null}
                </PopoverBody>
                <PopoverFooter display='flex' justifyContent='flex-end'>
                    <ButtonGroup>
                        <Button variant='primary' onClick={saveVirtualWell} /*isDisabled={shallowEqual(well, model)}*/>
                            {i18n.t(dict.common.save)}
                        </Button>
                        <Button variant='cancel' onClick={() => p.onClose()}>
                            {i18n.t(dict.common.close)}
                        </Button>
                    </ButtonGroup>
                </PopoverFooter>
            </PopoverContent>
        </Popover>
    );
};

interface EditableProps {
    name: string;
    allowEditing?: boolean;
    onChange: (value: number) => void;
}

export const EditableWellName: FC<EditableProps> = (p: EditableProps) => {
    const EditableControls = () => {
        const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = useEditableControls();

        return isEditing ? (
            <ButtonGroup size='sm' variant={'cancel'}>
                <IconButton aria-label='icon-1' icon={<CheckIcon />} {...getSubmitButtonProps()} />
                <IconButton aria-label='icon-2' icon={<CloseIcon />} {...getCancelButtonProps()} />
            </ButtonGroup>
        ) : p.allowEditing ? (
            <Button variant={'unstyled'} {...getEditButtonProps()}>
                <EditIcon boxSize={6} color={colors.icons.grey} />
            </Button>
        ) : null;
    };

    const onChangeHandler = (value: string) => {
        if (value && tryParse(value)) {
            p.onChange(+value);
        }
    };

    return (
        <Editable defaultValue={p.name} isPreviewFocusable={false} onChange={onChangeHandler}>
            <Flex alignItems='center'>
                <Heading size='h3'>
                    {i18n.t(dict.common.well)} <EditablePreview />
                </Heading>
                <Heading size='h3'>
                    <EditableInput formNoValidate mx={2} width={'150px'} height={'32px'} />
                </Heading>
                <EditableControls />
            </Flex>
        </Editable>
    );
};
