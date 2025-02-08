import React from 'react';

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
    Text,
    Box,
    SimpleGrid,
    Tag,
    Spacer,
    ButtonGroup
} from '@chakra-ui/react';
import { ProcessingStatusEnum } from 'common/entities/processingStatusEnum';
import i18n from 'i18next';
import {
    always,
    cond,
    equals,
    filter,
    flatten,
    head,
    ifElse,
    includes,
    indexOf,
    innerJoin,
    intersection,
    isEmpty,
    isNil,
    map,
    not,
    pipe,
    reject,
    splitAt,
    T
} from 'ramda';
import { useRecoilValue } from 'recoil';

import { CheckList, CheckListOption } from '../../../../common/components/checkList';
import { WarningIcon } from '../../../../common/components/customIcon/general';
import { Dropdown, DropdownOption, DropdownProps } from '../../../../common/components/dropdown/dropdown';
import { InputNumber } from '../../../../common/components/inputNumber';
import { CalculationProgress } from '../../../../common/components/kriging/calculationProgress';
import { Period } from '../../../../common/components/kriging/period';
import { BatchIntervalEvent } from '../../../../common/entities/batchIntervalEvent';
import { ids, Pair } from '../../../../common/entities/keyValue';
import { ParamDate } from '../../../../common/entities/paramDate';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import { firstDay } from '../../../../common/helpers/date';
import { isFn, nul, shallow } from '../../../../common/helpers/ramda';
import { u } from '../../../../common/helpers/strings';
import { uSyllabify } from '../../../../common/helpers/syllabify/ru';
import { KrigingCalcSettingsModel, KrigingDateValues } from '../../../../input/entities/krigingCalcSettings';
import { PlastZoneEnum } from '../../../../input/enums/plastZoneEnum';
import { RestrictionEnum } from '../../../../input/enums/restrictionEnum';
import { VarioModelEnum } from '../../../../input/enums/varioModelEnum';
import { currentSpot } from '../../../../prediction/store/well';
import { batchStatusState } from '../../../../prediction/subModules/results/store/batchStatus';
import { krigingCalcSettingsState } from '../../../../prediction/subModules/results/store/krigingCalcSettings';
import { useKrigingMutations } from '../../../../prediction/subModules/results/store/krigingMutations';
import { CalculationModeEnum, isOptimization } from '../../../enums/calculationModeEnum';
import { Switcher } from './switcher';

import css from './index.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

interface Props {
    availableGrids: GridMapEnum[];
    mode?: CalculationModeEnum;
    onGoToMap?: () => void;
}

export const CalculationGridModal: React.FC<Props> = ({ availableGrids, mode, onGoToMap }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const batchStatus = useRecoilValue(batchStatusState);
    const model = useRecoilValue(krigingCalcSettingsState);
    const well = useRecoilValue(currentSpot);

    const dispatcher = useKrigingMutations();

    const param = innerJoin((t, param) => param === t.id, toShow(), model.params);

    const [isCalculation, setIsCalculation] = React.useState<boolean>(false);
    const [batchIntervalEvent] = React.useState<BatchIntervalEvent>(new BatchIntervalEvent());
    const [innerModel, setInnerModel] = React.useState<KrigingCalcSettingsModel>(model);
    const [currentParam, setCurrentParam] = React.useState<GridMapEnum>((head(param) || { id: null }).id);
    // const [pressAbort, setPressAbort] = React.useState<boolean>();
    // const [pressForceAbort, setPressForceAbort] = React.useState<boolean>();

    const improvement = mode === CalculationModeEnum.Improvement;

    const handleCheckBatchStatus = () => {
        dispatcher.check();
    };

    React.useEffect(() => {
        if (isOpen && improvement) {
            setInnerModel(
                shallow<KrigingCalcSettingsModel>(innerModel, {
                    startDate: firstDay(model.defaultDates.maxDate),
                    endDate: firstDay(model.defaultDates.maxDate),
                    params: [
                        GridMapEnum.InitialTransmissibilityAfterAdaptation,
                        GridMapEnum.InitialInterwellVolumeAfterAdaptation,
                        GridMapEnum.VolumeWaterCut,
                        GridMapEnum.SWLAdaptation,
                        GridMapEnum.SOWCRAdaptation,
                        GridMapEnum.CurrentK,
                        GridMapEnum.InitialSaturationAdaptation
                    ]
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, improvement]);

    React.useEffect(() => {
        if (!isCalculation && batchStatus) {
            batchIntervalEvent.activateBatchCache(
                batchStatus,
                `prediction_kriging_${well.prodObjId}`,
                handleCheckBatchStatus
            );

            setIsCalculation(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batchStatus]);

    if (isNil(well) || isNil(model)) {
        return null;
    }

    const handleOpenClick = () => {
        //loadKrigingSettings();
        onOpen();
    };

    const handleClose = () => {
        batchIntervalEvent.stop();

        dispatcher.clear(false);
        setIsCalculation(false);
        onClose();
    };

    const handleGoToMap = () => {
        if (improvement) {
            isFn(onGoToMap) && onGoToMap();
        } else {
            dispatcher.loadAvailableGrids(mode);
        }

        handleClose();
    };

    const submit = () => {
        dispatcher.start(
            shallow(innerModel, {
                oilFieldId: well.oilFieldId,
                productionObjectId: well.prodObjId,
                optimization: isOptimization(mode)
            })
        );
    };

    const onChangeSelectionData = (value: string, checked: boolean): void => {
        let params = Object.assign([], innerModel.params);

        if (checked) {
            params.push(value);
        } else {
            params.splice(params.indexOf(value), 1);
        }

        setInnerModel(shallow(innerModel, { params }));
        setCurrentParam(getCurrentParam(currentParam, params, checked, value as GridMapEnum));
    };

    const forceAbortKriging = () => {
        batchIntervalEvent.stop();
        dispatcher.clear(true);
    };

    const getMapNames = (): string[] =>
        pipe(
            filter<CheckListOption>(x => !!x.checked),
            map(x => x.text)
        )(flatten([requiredFields(innerModel, availableGrids), secondFields(innerModel, availableGrids)]));

    const varioModelDropdown: DropdownProps = {
        options: [new DropdownOption(VarioModelEnum.Power, i18n.t(dict.kriging.degree))],
        value: innerModel.varioModel
    };

    return (
        <>
            <Button onClick={handleOpenClick} variant='primary' ml='30px'>
                {i18n.t(dict.common.calcMap)}
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} size={batchStatus ? '2xl' : '3xl'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{i18n.t(dict.common.calcMap)}</ModalHeader>
                    {batchStatus ? (
                        <Box>
                            <CalculationProgress
                                className={css.kriging__step}
                                title={i18n.t(dict.map.calculationParams)}
                                // abortPressed={pressAbort}
                                // forceAbortPressed={pressForceAbort}
                                forceAbort={() => forceAbortKriging()}
                                abort={() => dispatcher.abort()}
                                batch={batchStatus}
                                mapNames={getMapNames()}
                                goToMap={() => handleGoToMap()}
                                goToParams={() => dispatcher.clear(false)}
                            />
                        </Box>
                    ) : (
                        <>
                            <ModalCloseButton />
                            <ModalBody>
                                <Group text={i18n.t(dict.kriging.groups.selection)}>
                                    {improvement ? (
                                        <Box>
                                            <CheckList
                                                className={css.kriging__checklist}
                                                options={briefFields(innerModel, availableGrids)}
                                                onChange={(v, c) => onChangeSelectionData(v, c)}
                                            />
                                        </Box>
                                    ) : (
                                        <SimpleGrid columns={2} spacing={4}>
                                            <Box>
                                                <CheckList
                                                    className={css.kriging__checklist}
                                                    options={requiredFields(innerModel, availableGrids)}
                                                    onChange={(v, c) => onChangeSelectionData(v, c)}
                                                />
                                            </Box>
                                            <Box>
                                                <CheckList
                                                    className={css.kriging__checklist}
                                                    options={secondFields(innerModel, availableGrids)}
                                                    onChange={(v, c) => onChangeSelectionData(v, c)}
                                                />
                                                <Box pl={'33px'}>
                                                    <Period
                                                        show={showPeriod(innerModel.params)}
                                                        data={getDataForPeriod(model.values, currentParam)}
                                                        model={innerModel}
                                                        onChange={model => setInnerModel(model)}
                                                    />
                                                    <Switcher
                                                        current={currentParam}
                                                        model={innerModel}
                                                        next={() =>
                                                            setCurrentParam(getNext(innerModel.params, currentParam))
                                                        }
                                                        toShow={toShow()}
                                                    />
                                                </Box>
                                            </Box>
                                        </SimpleGrid>
                                    )}
                                </Group>
                                {improvement ? null : (
                                    <>
                                        <Group text={i18n.t(dict.kriging.groups.limitations)}>
                                            <CheckList
                                                className={css.kriging__checklist}
                                                options={restrictions(innerModel)}
                                                onChange={(v, c) =>
                                                    setInnerModel(shallow(innerModel, { onlyInnerActiveContour: c }))
                                                }
                                            />
                                        </Group>
                                        <Group text={i18n.t(dict.kriging.groups.plastZone)}>
                                            <SimpleGrid columns={2} spacing={4}>
                                                <CheckList
                                                    className={css.kriging__checklist}
                                                    options={formationZones1(innerModel)}
                                                    onChange={(v, c) => setInnerModel(shallow(innerModel, { [v]: c }))}
                                                />
                                                <CheckList
                                                    className={css.kriging__checklist}
                                                    options={formationZones2(innerModel)}
                                                    onChange={(v, c) => setInnerModel(shallow(innerModel, { [v]: c }))}
                                                />
                                            </SimpleGrid>
                                        </Group>
                                        <Group text={i18n.t(dict.kriging.groups.kriging)}>
                                            <SimpleGrid columns={2} spacing={4}>
                                                <Box>
                                                    <div className={css.kriging__param}>
                                                        <span className='kriging__param-name'>
                                                            {i18n.t(dict.kriging.varioModel)}:{' '}
                                                        </span>
                                                        <Dropdown
                                                            className='dropdown_well-types'
                                                            width={150}
                                                            size='sm'
                                                            {...varioModelDropdown}
                                                        />
                                                    </div>
                                                    <div className={css.kriging__param}>
                                                        <span className='kriging__param-name'>
                                                            {i18n.t(dict.kriging.varioDegree)}:{' '}
                                                        </span>
                                                        <InputNumber
                                                            width={100}
                                                            className={css.kriging__numeric}
                                                            value={innerModel.varioDegree}
                                                            step={0.1}
                                                            size='sm'
                                                            onChange={value =>
                                                                setInnerModel(
                                                                    shallow(innerModel, { varioDegree: +value })
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className={css.kriging__param}>
                                                        <span className='kriging__param-name'>
                                                            {i18n.t(dict.kriging.varioRadius)}:{' '}
                                                        </span>
                                                        <InputNumber
                                                            className={css.kriging__numeric}
                                                            value={innerModel.varioRadius}
                                                            step={1000}
                                                            size='sm'
                                                            width={100}
                                                            onChange={value =>
                                                                setInnerModel(
                                                                    shallow(innerModel, { varioRadius: +value })
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </Box>
                                                <Box>
                                                    <div className={css.kriging__param}>
                                                        <span className='kriging__param-name'>
                                                            {i18n.t(dict.kriging.preliminaryCalcStep)}:{' '}
                                                        </span>
                                                        <InputNumber
                                                            className={css.kriging__numeric}
                                                            value={innerModel.preliminaryCalcStep}
                                                            step={100}
                                                            size='sm'
                                                            width={100}
                                                            onChange={value =>
                                                                setInnerModel(
                                                                    shallow(innerModel, { preliminaryCalcStep: +value })
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className={css.kriging__param}>
                                                        <span className='kriging__param-name'>
                                                            {i18n.t(dict.kriging.krigingCalcStep)}:{' '}
                                                        </span>
                                                        <InputNumber
                                                            className={css.kriging__numeric}
                                                            size='sm'
                                                            value={innerModel.krigingCalcStep}
                                                            step={25}
                                                            width={100}
                                                            onChange={value =>
                                                                setInnerModel(
                                                                    shallow(innerModel, { krigingCalcStep: +value })
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </Box>
                                            </SimpleGrid>
                                        </Group>
                                    </>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Box>
                                    <Tag bg='#FFF8EB' size='lg' mr='20px'>
                                        <WarningIcon boxSize={9} p={'3px'} />
                                        <Text fontSize='12px' textColor='typo.primary' padding='10px'>
                                            {i18n.t(dict.map.warningDataLost)}
                                        </Text>
                                    </Tag>
                                </Box>
                                <Spacer />
                                <ButtonGroup>
                                    <Button variant='primary' onClick={submit}>
                                        {i18n.t(dict.common.calc)}
                                    </Button>
                                    <Button onClick={handleClose} variant='cancel'>
                                        {i18n.t(dict.common.cancel)}
                                    </Button>
                                </ButtonGroup>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

const requiredFields = (model: KrigingCalcSettingsModel, availableGrids: GridMapEnum[]): Array<CheckListOption> => {
    const getParams = (param: string) => {
        return model.params.indexOf(param) >= 0;
    };

    return [
        new CheckListOption(
            i18n.t(dict.common.params.initialTransmissibilityBeforeAdaptation),
            GridMapEnum.InitialTransmissibilityBeforeAdaptation,
            getParams(GridMapEnum.InitialTransmissibilityBeforeAdaptation),
            false,
            includes(GridMapEnum.InitialTransmissibilityBeforeAdaptation, availableGrids)
        ),
        new CheckListOption(
            i18n.t(dict.common.params.initialTransmissibilityAfterAdaptation),
            GridMapEnum.InitialTransmissibilityAfterAdaptation,
            getParams(GridMapEnum.InitialTransmissibilityAfterAdaptation),
            false,
            includes(GridMapEnum.InitialTransmissibilityAfterAdaptation, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.common.params.initialInterwellVolumeBeforeAdaptation))),
            GridMapEnum.InitialInterwellVolumeBeforeAdaptation,
            getParams(GridMapEnum.InitialInterwellVolumeBeforeAdaptation),
            false,
            includes(GridMapEnum.InitialInterwellVolumeBeforeAdaptation, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.common.params.initialInterwellVolumeAfterAdaptation))),
            GridMapEnum.InitialInterwellVolumeAfterAdaptation,
            getParams(GridMapEnum.InitialInterwellVolumeAfterAdaptation),
            false,
            includes(GridMapEnum.InitialInterwellVolumeAfterAdaptation, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.proxy.wellGrid.params.SWLAdaptation))),
            GridMapEnum.SWLAdaptation,
            getParams(GridMapEnum.SWLAdaptation),
            false,
            includes(GridMapEnum.SWLAdaptation, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.proxy.wellGrid.params.SOWCRAdaptation))),
            GridMapEnum.SOWCRAdaptation,
            getParams(GridMapEnum.SOWCRAdaptation),
            false,
            includes(GridMapEnum.SOWCRAdaptation, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.common.params.currentK))),
            GridMapEnum.CurrentK,
            getParams(GridMapEnum.CurrentK),
            false,
            includes(GridMapEnum.CurrentK, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.common.params.initialSaturationAdaptation))),
            GridMapEnum.InitialSaturationAdaptation,
            getParams(GridMapEnum.InitialSaturationAdaptation),
            false,
            includes(GridMapEnum.InitialSaturationAdaptation, availableGrids)
        )
    ];
};

const secondFields = (model: KrigingCalcSettingsModel, availableGrids: GridMapEnum[]): Array<CheckListOption> => {
    const getParams = (param: string) => {
        return model.params.indexOf(param) >= 0;
    };

    return [
        new CheckListOption(
            i18n.t(dict.common.params.pressureRes),
            GridMapEnum.Pressure,
            getParams(GridMapEnum.Pressure),
            false,
            includes(GridMapEnum.Pressure, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.common.params.oilSaturation))),
            GridMapEnum.VolumeWaterCut,
            getParams(GridMapEnum.VolumeWaterCut),
            false,
            includes(GridMapEnum.VolumeWaterCut, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.common.params.currentOilSaturatedThickness))),
            GridMapEnum.CurrentOilSaturatedThickness,
            getParams(GridMapEnum.CurrentOilSaturatedThickness),
            false,
            includes(GridMapEnum.CurrentOilSaturatedThickness, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.common.params.currentKH))),
            GridMapEnum.CurrentKH,
            getParams(GridMapEnum.CurrentKH),
            false,
            includes(GridMapEnum.CurrentKH, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.common.params.skinFactor))),
            GridMapEnum.SkinFactor,
            getParams(GridMapEnum.SkinFactor),
            false,
            includes(GridMapEnum.SkinFactor, availableGrids)
        )
    ];
};

const briefFields = (model: KrigingCalcSettingsModel, availableGrids: GridMapEnum[]): Array<CheckListOption> => {
    const getParams = (param: string) => {
        return model.params.indexOf(param) >= 0;
    };

    return [
        new CheckListOption(
            i18n.t(dict.common.params.initialTransmissibilityAfterAdaptation),
            GridMapEnum.InitialTransmissibilityAfterAdaptation,
            getParams(GridMapEnum.InitialTransmissibilityAfterAdaptation),
            false,
            includes(GridMapEnum.InitialTransmissibilityAfterAdaptation, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.common.params.initialInterwellVolumeAfterAdaptation))),
            GridMapEnum.InitialInterwellVolumeAfterAdaptation,
            getParams(GridMapEnum.InitialInterwellVolumeAfterAdaptation),
            false,
            includes(GridMapEnum.InitialInterwellVolumeAfterAdaptation, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.common.params.oilSaturation))),
            GridMapEnum.VolumeWaterCut,
            getParams(GridMapEnum.VolumeWaterCut),
            false,
            includes(GridMapEnum.VolumeWaterCut, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.proxy.wellGrid.params.SWLAdaptation))),
            GridMapEnum.SWLAdaptation,
            getParams(GridMapEnum.SWLAdaptation),
            false,
            includes(GridMapEnum.SWLAdaptation, availableGrids)
        ),
        new CheckListOption(
            u(uSyllabify(i18n.t(dict.proxy.wellGrid.params.SOWCRAdaptation))),
            GridMapEnum.SOWCRAdaptation,
            getParams(GridMapEnum.SOWCRAdaptation),
            false,
            includes(GridMapEnum.SOWCRAdaptation, availableGrids)
        )
    ];
};

const restrictions = (model: KrigingCalcSettingsModel): Array<CheckListOption> => {
    return [
        new CheckListOption(
            i18n.t(dict.kriging.onlyInnerActiveContour),
            RestrictionEnum.OnlyInnerActiveContour,
            model.onlyInnerActiveContour
        )
    ];
};

const formationZones1 = (model: KrigingCalcSettingsModel): Array<CheckListOption> => {
    return [
        new CheckListOption(i18n.t(dict.kriging.zones.non), PlastZoneEnum.zoneNonCollector, model.zoneNonCollector),
        new CheckListOption(i18n.t(dict.kriging.zones.pureWater), PlastZoneEnum.zonePureWater, model.zonePureWater)
    ];
};

const formationZones2 = (model: KrigingCalcSettingsModel): Array<CheckListOption> => {
    return [
        new CheckListOption(i18n.t(dict.kriging.zones.waterOil), PlastZoneEnum.zoneWaterOil, model.zoneWaterOil),
        new CheckListOption(i18n.t(dict.kriging.zones.pureOil), PlastZoneEnum.zonePureOil, model.zonePureOil)
    ];
};

type GroupProps = React.PropsWithChildren<{ text: string }>;

export const Group: React.FC<GroupProps> = ({ children, text }: GroupProps) => (
    <Box className={css.kriging__group}>
        <Box className='group__title' pt='10px' pb='10px' w='100%'>
            <Text className='group__title-text'>{text}</Text>
        </Box>
        <Box className='group__content'>{children}</Box>
    </Box>
);

const toShow = (): Pair<GridMapEnum, string>[] => [
    { id: GridMapEnum.Pressure, name: i18n.t(dict.common.params.pressureRes) },
    { id: GridMapEnum.VolumeWaterCut, name: i18n.t(dict.common.params.oilSaturation) },
    { id: GridMapEnum.CurrentOilSaturatedThickness, name: i18n.t(dict.common.params.currentOilSaturatedThickness) },
    { id: GridMapEnum.CurrentKH, name: i18n.t(dict.common.params.currentKH) },
    { id: GridMapEnum.SkinFactor, name: i18n.t(dict.common.params.skinFactor) }
];

const getDataForPeriod = (values: KrigingDateValues, current: GridMapEnum): ParamDate[] =>
    cond([
        [equals(GridMapEnum.Pressure), () => values.pressureRes],
        [equals(GridMapEnum.VolumeWaterCut), () => values.oilSaturation],
        [equals(GridMapEnum.CurrentOilSaturatedThickness), () => values.oilSaturation],
        [equals(GridMapEnum.CurrentKH), () => values.oilSaturation],
        [equals(GridMapEnum.SkinFactor), () => values.oilSaturation],
        [T, nul]
    ])(current);

const showPeriod = (params: string[]) => not(isEmpty(intersection(ids(toShow()), params)));

const splitByCurrent = (params: string[], current: GridMapEnum): { next: string[]; prev: string[] } => {
    const splitted = splitAt(indexOf(current, params), params);
    return {
        next: reject(x => x === current, splitted[1]),
        prev: reject(x => x === current, splitted[0])
    };
};

const getNext = (params: string[], current: GridMapEnum): GridMapEnum =>
    pipe(
        x => intersection(x, ids(toShow())),
        x =>
            ifElse(
                isEmpty,
                () => head(splitByCurrent(x, current).prev),
                v => v[0]
            )(splitByCurrent(x, current).next)
    )(params);

const getCurrentParam = (old: GridMapEnum, allParams: string[], add: boolean, newOne: GridMapEnum): GridMapEnum => {
    if (not(includes(newOne, ids(toShow())))) {
        return old;
    }

    if (add) {
        return ifElse(includes(newOne), always(newOne), always(old))(allParams as GridMapEnum[]);
    } else {
        return ifElse(isEmpty, nul, head)(intersection(allParams as GridMapEnum[], ids(toShow())));
    }
};
