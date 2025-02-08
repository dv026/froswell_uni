import React, { FC, PropsWithChildren, useEffect, useState } from 'react';

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
    Heading,
    Tag,
    Spacer,
    ButtonGroup
} from '@chakra-ui/react';
import { TFunction } from 'i18next';
import {
    always,
    concat,
    filter,
    head,
    ifElse,
    includes,
    innerJoin,
    intersection,
    isEmpty,
    isNil,
    map,
    not,
    pipe
} from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilRefresher_UNSTABLE, useRecoilValue, useResetRecoilState } from 'recoil';

import { CheckList, CheckListOption } from '../../../../common/components/checkList';
import { WarningIcon } from '../../../../common/components/customIcon/general';
import { Dropdown, DropdownOption, DropdownProps } from '../../../../common/components/dropdown/dropdown';
import { InputNumber } from '../../../../common/components/inputNumber';
import { CalculationProgress } from '../../../../common/components/kriging/calculationProgress';
import { Period } from '../../../../common/components/kriging/period';
import { SelectPlast } from '../../../../common/components/selectPlast';
import { BatchIntervalEvent } from '../../../../common/entities/batchIntervalEvent';
import { ids, Pair } from '../../../../common/entities/keyValue';
import { GridMapEnum } from '../../../../common/enums/gridMapEnum';
import i18n from '../../../../common/helpers/i18n';
import * as Prm from '../../../../common/helpers/parameters';
import { isNullOrEmpty, nul, shallow } from '../../../../common/helpers/ramda';
import { KrigingCalcSettingsModel } from '../../../../input/entities/krigingCalcSettings';
import { PlastZoneEnum } from '../../../../input/enums/plastZoneEnum';
import { RestrictionEnum } from '../../../../input/enums/restrictionEnum';
import { VarioModelEnum } from '../../../../input/enums/varioModelEnum';
import { MapSettingModel } from '../../../entities/mapSettingModel';
import { batchStatusState } from '../../../store/batchStatus';
import { gridMapSettings } from '../../../store/gridMapSettings';
import { useKrigingMutations } from '../../../store/krigingMutations';
import { krigingSettingsState } from '../../../store/krigingSettings';
import { mapSettingsState } from '../../../store/mapSettings';
import { plastListState } from '../../../store/plasts';
import { currentSpot } from '../../../store/well';

import css from './index.module.less';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

const toShow = (): Pair<GridMapEnum, string>[] => [
    { id: GridMapEnum.Pressure, name: i18n.t(dict.common.params.pressureRes) },
    { id: GridMapEnum.VolumeWaterCut, name: i18n.t(dict.common.params.oilSaturation) }
];

export const CalculationGridModal = () => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const batchStatus = useRecoilValue(batchStatusState);
    const mapSettings = useRecoilValue(mapSettingsState);
    const model = useRecoilValue(krigingSettingsState);
    const plasts = useRecoilValue(plastListState);
    const well = useRecoilValue(currentSpot);

    const refreshMapSettings = useRecoilRefresher_UNSTABLE(mapSettingsState);
    const refreshGridMapSettings = useRecoilRefresher_UNSTABLE(gridMapSettings);

    const kriging = useKrigingMutations();

    const handleCheckBatchStatus = () => {
        kriging.check(batchStatus?.id);
    };

    const param = innerJoin((t, param) => param === t.id, toShow(), model.params);

    const [isCalculation, setIsCalculation] = useState<boolean>(false);
    const [batchIntervalEvent] = useState<BatchIntervalEvent>(new BatchIntervalEvent());
    const [innerModel, setInnerModel] = useState<KrigingCalcSettingsModel>(model);
    const [currentParam, setCurrentParam] = useState<GridMapEnum>((head(param) || { id: null }).id);

    useEffect(() => {
        setInnerModel(model);
    }, [model]);

    useEffect(() => {
        if (!isCalculation && batchStatus) {
            batchIntervalEvent.activateBatchCache(
                batchStatus,
                `input_kriging_${well.prodObjId}`,
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
        //d(loadKrigingSettings());
        onOpen();
    };

    const handleClose = () => {
        onClose();

        batchIntervalEvent.stop();
        kriging.clear(false);
        setIsCalculation(false);
    };

    const handleGoToMap = async () => {
        handleClose();

        if (isNullOrEmpty(innerModel.params)) {
            return;
        }

        refreshMapSettings();
        refreshGridMapSettings();
    };

    const submit = () => {
        kriging.calculate(shallow(innerModel, { oilFieldId: well.oilFieldId, productionObjectId: well.prodObjId }));
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
        kriging.clear(true);
    };

    const getMapNames = (): string[] => {
        return pipe(
            filter<CheckListOption>(x => !!x.checked),
            map<CheckListOption, string>(x => x.text)
        )(concat(requiredFields(innerModel, mapSettings, t), secondaryFields(innerModel, mapSettings, t)));
    };

    const varioModelDropdown: DropdownProps = {
        options: [new DropdownOption(VarioModelEnum.Power, t(dict.kriging.degree))],
        value: innerModel.varioModel
    };

    return (
        <>
            <Button onClick={handleOpenClick} variant='primary' ml='30px'>
                {t(dict.common.calcMap)}
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} size='3xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t(dict.common.calcMap)}</ModalHeader>
                    {batchStatus ? (
                        <Box minHeight='250px'>
                            <CalculationProgress
                                className={css.kriging__step}
                                title={t(dict.map.calculationParams)}
                                // abortPressed={pressAbort}
                                // forceAbortPressed={pressForceAbort}
                                forceAbort={() => forceAbortKriging()}
                                abort={() => kriging.abort(batchStatus?.id)}
                                batch={batchStatus}
                                mapNames={getMapNames()}
                                goToMap={() => handleGoToMap()}
                                goToParams={() => kriging.clear(false)}
                            />
                        </Box>
                    ) : (
                        <>
                            <ModalCloseButton />
                            <ModalBody>
                                <Dropdown
                                    value={innerModel.byObject}
                                    width={200}
                                    options={[
                                        new DropdownOption(1, t(dict.geoModel.calcByObject)),
                                        new DropdownOption(2, t(dict.geoModel.calcByPlast))
                                    ]}
                                    onChange={e => setInnerModel(shallow(innerModel, { byObject: +e.target.value }))}
                                />
                                {innerModel.byObject === 2 ? (
                                    <Box mt='10px'>
                                        <SelectPlast
                                            selected={innerModel.plastId}
                                            dictionary={plasts}
                                            problems={[]}
                                            onChange={id => setInnerModel(shallow(innerModel, { plastId: id }))}
                                        />
                                    </Box>
                                ) : null}
                                <Group text={t(dict.kriging.groups.selection)}>
                                    <SimpleGrid columns={2} spacing={4}>
                                        <Box>
                                            <Heading size='h5'>{t(dict.geoModel.paramsRequired)}:</Heading>
                                            <CheckList
                                                className={css.kriging__checklist}
                                                options={requiredFields(innerModel, mapSettings, t)}
                                                onChange={onChangeSelectionData}
                                            />
                                        </Box>
                                        <Box>
                                            <Heading size='h5'>{t(dict.geoModel.paramsAdditional)}:</Heading>
                                            <CheckList
                                                className={css.kriging__checklist}
                                                options={secondaryFields(innerModel, mapSettings, t)}
                                                onChange={onChangeSelectionData}
                                            />
                                            <Box pl={'33px'}>
                                                <Period
                                                    data={model.values.avgPressureZab}
                                                    model={innerModel}
                                                    show={innerModel.params.indexOf(GridMapEnum.PressureZab) >= 0}
                                                    onChange={setInnerModel}
                                                />
                                                {innerModel.params.indexOf(GridMapEnum.PressureZab) >= 0 ? (
                                                    <div className={css.kriging__param}>{Prm.pressureZab()}</div>
                                                ) : null}
                                            </Box>
                                        </Box>
                                    </SimpleGrid>
                                </Group>
                                <Group text={t(dict.kriging.groups.limitations)}>
                                    <CheckList
                                        className={css.kriging__checklist}
                                        options={restrictions(innerModel, t)}
                                        onChange={(v, c) =>
                                            setInnerModel(shallow(innerModel, { onlyInnerActiveContour: c }))
                                        }
                                    />
                                </Group>
                                <Group text={t(dict.kriging.groups.plastZone)}>
                                    <SimpleGrid columns={2} spacing={4}>
                                        <CheckList
                                            className={css.kriging__checklist}
                                            options={formationZones1(innerModel, t)}
                                            onChange={(v, c) => setInnerModel(shallow(innerModel, { [v]: c }))}
                                        />
                                        <CheckList
                                            className={css.kriging__checklist}
                                            options={formationZones2(innerModel, t)}
                                            onChange={(v, c) => setInnerModel(shallow(innerModel, { [v]: c }))}
                                        />
                                    </SimpleGrid>
                                </Group>
                                <Group text={t(dict.kriging.groups.kriging)}>
                                    <SimpleGrid columns={2} spacing={4}>
                                        <Box>
                                            <div className={css.kriging__param}>
                                                <span className='kriging__param-name'>
                                                    {t(dict.kriging.varioModel)}:{' '}
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
                                                    {t(dict.kriging.varioDegree)}:{' '}
                                                </span>
                                                <InputNumber
                                                    width={100}
                                                    className={css.kriging__numeric}
                                                    value={innerModel.varioDegree}
                                                    step={0.1}
                                                    size='sm'
                                                    onChange={value =>
                                                        setInnerModel(shallow(innerModel, { varioDegree: +value }))
                                                    }
                                                />
                                            </div>
                                            <div className={css.kriging__param}>
                                                <span className='kriging__param-name'>
                                                    {t(dict.kriging.varioRadius)}:{' '}
                                                </span>
                                                <InputNumber
                                                    className={css.kriging__numeric}
                                                    value={innerModel.varioRadius}
                                                    step={1000}
                                                    size='sm'
                                                    width={100}
                                                    onChange={value =>
                                                        setInnerModel(shallow(innerModel, { varioRadius: +value }))
                                                    }
                                                />
                                            </div>
                                        </Box>
                                        <Box>
                                            <div className={css.kriging__param}>
                                                <span className='kriging__param-name'>
                                                    {t(dict.kriging.preliminaryCalcStep)}:{' '}
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
                                                    {t(dict.kriging.krigingCalcStep)}:{' '}
                                                </span>
                                                <InputNumber
                                                    className={css.kriging__numeric}
                                                    size='sm'
                                                    value={innerModel.krigingCalcStep}
                                                    step={25}
                                                    width={100}
                                                    onChange={value =>
                                                        setInnerModel(shallow(innerModel, { krigingCalcStep: +value }))
                                                    }
                                                />
                                            </div>
                                        </Box>
                                    </SimpleGrid>
                                </Group>
                            </ModalBody>
                            <ModalFooter>
                                <Box>
                                    <Tag bg='#FFF8EB' size='lg' mr='20px'>
                                        <WarningIcon boxSize={9} p={'3px'} />
                                        <Text fontSize='12px' textColor='typo.primary' padding='10px'>
                                            {t(dict.map.warningDataLost)}
                                        </Text>
                                    </Tag>
                                </Box>
                                <Spacer />
                                <ButtonGroup>
                                    <Button variant='primary' onClick={submit}>
                                        {t(dict.common.calc)}
                                    </Button>
                                    <Button onClick={handleClose} variant='cancel'>
                                        {t(dict.common.cancel)}
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

const requiredFields = (
    model: KrigingCalcSettingsModel,
    mapSettings: MapSettingModel,
    t: TFunction<'translation'>
): CheckListOption[] => {
    const getParams = (param: string) => {
        return model.params.indexOf(param) >= 0;
    };

    const availableGrids = mapSettings.availableGrids ?? [];

    return [
        new CheckListOption(
            t(dict.kriging.params.power),
            GridMapEnum.Power,
            getParams(GridMapEnum.Power),
            false,
            includes(GridMapEnum.Power, availableGrids)
        ),
        new CheckListOption(
            t(dict.kriging.params.porosity),
            GridMapEnum.Porosity,
            getParams(GridMapEnum.Porosity),
            false,
            includes(GridMapEnum.Porosity, availableGrids)
        ),
        new CheckListOption(
            t(dict.kriging.params.permeability),
            GridMapEnum.Permeability,
            getParams(GridMapEnum.Permeability),
            false,
            includes(GridMapEnum.Permeability, availableGrids)
        ),
        new CheckListOption(
            t(dict.kriging.params.oilSaturation),
            GridMapEnum.OilSaturation,
            getParams(GridMapEnum.OilSaturation),
            false,
            includes(GridMapEnum.OilSaturation, availableGrids)
        )
    ];
};

const secondaryFields = (
    model: KrigingCalcSettingsModel,
    mapSettings: MapSettingModel,
    t: TFunction<'translation'>
): Array<CheckListOption> => {
    const getParams = (param: string) => {
        return model.params.indexOf(param) >= 0;
    };

    const availableGrids = mapSettings.availableGrids ?? [];

    return [
        new CheckListOption(
            t(dict.kriging.params.topAbs),
            GridMapEnum.TopAbs,
            getParams(GridMapEnum.TopAbs),
            false,
            includes(GridMapEnum.TopAbs, availableGrids)
        ),
        new CheckListOption(
            t(dict.kriging.params.bottomAbs),
            GridMapEnum.BottomAbs,
            getParams(GridMapEnum.BottomAbs),
            false,
            includes(GridMapEnum.BottomAbs, availableGrids)
        ),
        new CheckListOption(
            t(dict.kriging.params.pressureZab),
            GridMapEnum.PressureZab,
            getParams(GridMapEnum.PressureZab),
            false,
            includes(GridMapEnum.PressureZab, availableGrids)
        )
    ];
};

const restrictions = (model: KrigingCalcSettingsModel, t: TFunction<'translation'>): Array<CheckListOption> => {
    return [
        new CheckListOption(
            t(dict.kriging.onlyInnerActiveContour),
            RestrictionEnum.OnlyInnerActiveContour,
            model.onlyInnerActiveContour
        )
    ];
};

const formationZones1 = (model: KrigingCalcSettingsModel, t: TFunction<'translation'>): Array<CheckListOption> => {
    return [
        new CheckListOption(t(dict.kriging.zones.non), PlastZoneEnum.zoneNonCollector, model.zoneNonCollector),
        new CheckListOption(t(dict.kriging.zones.pureWater), PlastZoneEnum.zonePureWater, model.zonePureWater)
    ];
};

const formationZones2 = (model: KrigingCalcSettingsModel, t: TFunction<'translation'>): Array<CheckListOption> => {
    return [
        new CheckListOption(t(dict.kriging.zones.waterOil), PlastZoneEnum.zoneWaterOil, model.zoneWaterOil),
        new CheckListOption(t(dict.kriging.zones.pureOil), PlastZoneEnum.zonePureOil, model.zonePureOil)
    ];
};

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

type GroupProps = PropsWithChildren<{ text: string }>;

export const Group: FC<GroupProps> = ({ children, text }: GroupProps) => (
    <Box className={css.kriging__group}>
        <Box className='group__title' pt='15px' pb='10px' w='100%'>
            <Text className='group__title-text'>{text}</Text>
        </Box>
        <Box className='group__content'>{children}</Box>
    </Box>
);
