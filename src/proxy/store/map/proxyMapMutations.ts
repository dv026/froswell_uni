import { calculatePermeabilities, savePermeabilities } from 'proxy/subModules/permeabilities/gateways/gateway';
import { dataState } from 'proxy/subModules/permeabilities/store/data';
import { paramsState } from 'proxy/subModules/permeabilities/store/params';
import { append, filter, find, flatten, map, reject } from 'ramda';
import { useRecoilCallback } from 'recoil';

import { CalculationModeEnum } from '../../../calculation/enums/calculationModeEnum';
import { calculationModeState } from '../../../calculation/store/calculationMode';
import { currentPlastId } from '../../../calculation/store/currentPlastId';
import { currentScenarioId } from '../../../calculation/store/currentScenarioId';
import { isLoadingWellGroupState } from '../../../calculation/store/isLoadingWellGroup';
import { selectedPolygonState, togglePolygonState } from '../../../calculation/store/polygon';
import { Point } from '../../../common/entities/canvas/point';
import { shallowEqual } from '../../../common/helpers/compare';
import { shallow } from '../../../common/helpers/ramda';
import { optimisationData } from '../../../prediction/subModules/wellGrid/components/optimization/dataManager';
import { InterwellsCalculationParams } from '../../entities/proxyMap/calculationSettingsModel';
import { MapSettingModel } from '../../entities/proxyMap/mapSettingModel';
import { ModifiedImaginaryModel } from '../../entities/proxyMap/modifiedImaginaryModel';
import { OptimisationModel } from '../../entities/proxyMap/optimisationModel';
import { OptimisationSkinFactorModel } from '../../entities/proxyMap/optimisationSkinFactorModel';
import { UpdateOptimisationModel } from '../../entities/proxyMap/updateOptimisationModel';
import { nextId, WellGroup } from '../../entities/proxyMap/wellGroup';
import { WellPoint } from '../../entities/proxyMap/wellPoint';
import { OptimisationParamEnum } from '../../enums/wellGrid/optimisationParam';
import {
    calculationInterwellConnections,
    deleteWellGroup,
    intermediateWells,
    postRemoveAquifer,
    postSaveAquifer,
    postSaveCurrentGeologicalReserves,
    removeInterwellConnections,
    saveImaginaryWellsNew,
    saveWellGroup
} from '../../gateways/wellGrid/gateway';
import { getIntermediateImaginaryWells } from '../../services/mapService';
import { addImaginaryModeState } from '../../subModules/wellGrid/store/addImaginaryMode';
import { aquiferIsLoadingState, indentWaterOilContactState } from '../../subModules/wellGrid/store/aquifer';
import {
    currentVolumeReservoirState,
    geologicalReservesIsLoadingState,
    geologicalReservesSettings
} from '../../subModules/wellGrid/store/geologicalReserves';
import { interwellsIsLoadingState } from '../../subModules/wellGrid/store/intewells';
import { useRefetchAdaptationWellGroup } from '../../subModules/wellGroup/store/adaptationWellGroup';
import { currentSpot } from '../well';
import { mapSettingsState } from './mapSettings';
import { useImaginaryWellMutations } from './modifiedImaginaryModel';
import {
    optimizationParametersChangesState,
    optimizationParametersRefresher,
    optimizationParametersState
} from './optimizationParameters';

export function useProxyMapMutations() {
    const mutations = useImaginaryWellMutations();
    const refetchAdaptationWellGroup = useRefetchAdaptationWellGroup();

    const alterOptPresureZab = useRecoilCallback(({ snapshot, set }) => async (model: OptimisationModel) => {
        const optParametersChanges = await snapshot.getPromise(optimizationParametersChangesState);

        let values = reject(
            (it: OptimisationModel) => it.wellId === model.wellId && it.wellType === model.wellType,
            optParametersChanges.optimisation
        );

        values.push(model);

        set(
            optimizationParametersChangesState,
            shallow(optParametersChanges, {
                optimisation: values
            })
        );
    });

    const alterOptSkinFactor = useRecoilCallback(
        ({ snapshot, set }) =>
            async (value: OptimisationSkinFactorModel[]) => {
                const optParametersChanges = await snapshot.getPromise(optimizationParametersChangesState);

                set(
                    optimizationParametersChangesState,
                    shallow(optParametersChanges, {
                        optimisationSkinFactor: value
                    })
                );
            }
    );

    const backToOriginalData = useRecoilCallback(({ snapshot, set }) => async () => {
        const mapSettings = await snapshot.getPromise(mapSettingsState);

        set(
            mapSettingsState,
            shallow(mapSettings, {
                imaginaryPoints: mapSettings.originalImaginaryPoints,
                currentFundWithImaginary: mapSettings.originalCurrentFundWithImaginary
            })
        );

        mutations.clear();
    });

    const addNewVirtualWell = useRecoilCallback(({ snapshot, set }) => async (point: Point) => {
        const mapSettings = await snapshot.getPromise(mapSettingsState);
        const plastId = await snapshot.getPromise(currentPlastId);

        const maxId = mapSettings.maxWellId + 1;
        const newWell = WellPoint.createWell(maxId, point, plastId);

        set(
            mapSettingsState,
            shallow(mapSettings, {
                imaginaryPoints: append(newWell, mapSettings.imaginaryPoints),
                maxWellId: maxId
            })
        );

        mutations.createWell(newWell);
    });

    const changeWellPosition = useRecoilCallback(({ snapshot, set }) => async (wellPoint: WellPoint) => {
        const mapSettings = await snapshot.getPromise(mapSettingsState);

        if (!find(it => it.id === wellPoint.id, mapSettings.imaginaryPoints)) {
            return;
        }

        const newWell = WellPoint.copyFrom(wellPoint);

        let imgPoints = reject((it: WellPoint) => it.id === wellPoint.id, mapSettings.imaginaryPoints);
        imgPoints.push(newWell);

        set(mapSettingsState, shallow(mapSettings, { imaginaryPoints: imgPoints }));

        mutations.updateWell(newWell);
    });

    const updateVirtualWell = useRecoilCallback(
        ({ snapshot, set }) =>
            async (oldWell: WellPoint, wellPoint: WellPoint, toSave: boolean = false) => {
                const mapSettings = await snapshot.getPromise(mapSettingsState);
                const optParametersChanges = await snapshot.getPromise(optimizationParametersChangesState);

                const { points, imaginaryPoints, intermediatePoints, currentFundWithImaginary, drilledPoints } =
                    mapSettings;

                let tempMapSettings = mapSettings;
                let changedWell = WellPoint.copyFrom(wellPoint);

                // Переименование виртуальной скважины
                if (oldWell && oldWell.id !== wellPoint.id) {
                    const concatedPoints = flatten([
                        points,
                        imaginaryPoints,
                        intermediatePoints,
                        currentFundWithImaginary
                    ]);

                    if (!find(it => it.id === wellPoint.id, concatedPoints)) {
                        let imgPoints = reject((it: WellPoint) => it.id === oldWell.id, imaginaryPoints);

                        changedWell = WellPoint.copyRenameFrom(wellPoint);

                        tempMapSettings = shallow(tempMapSettings, {
                            imaginaryPoints: append(changedWell, imgPoints)
                        });
                    }
                }

                const well = find(it => it.id === wellPoint.id, imaginaryPoints);
                if (well) {
                    let imgPoints = reject((it: WellPoint) => it.id === wellPoint.id, imaginaryPoints);

                    tempMapSettings = shallow(tempMapSettings, {
                        imaginaryPoints: append(changedWell, imgPoints)
                    });
                } else {
                    // Внести изменения в реальную скважину (например, виртуальный характер работы)
                    const realWell = find(it => it.id === wellPoint.id, currentFundWithImaginary);
                    if (realWell) {
                        let points = reject((it: WellPoint) => it.id === wellPoint.id, currentFundWithImaginary);
                        let rejectDrilledPoints = reject((it: WellPoint) => it.id === wellPoint.id, drilledPoints);

                        tempMapSettings = shallow(tempMapSettings, {
                            currentFundWithImaginary: append(changedWell, points),
                            drilledPoints: changedWell.isEmptyTypeHistory
                                ? append(changedWell, rejectDrilledPoints)
                                : rejectDrilledPoints
                        });
                    }
                }

                if (!shallowEqual(mapSettings, tempMapSettings)) {
                    const model = await mutations.updateWell(changedWell, oldWell.id, wellPoint.id);

                    if (toSave) {
                        saveAllImaginaryWells(model, tempMapSettings);
                    }
                } else if (toSave && !optParametersChanges.isEmpty) {
                    saveAllImaginaryWells();
                }

                set(mapSettingsState, tempMapSettings);
            }
    );

    const removeVirtualWell = useRecoilCallback(({ snapshot, set }) => async (id: number) => {
        const mapSettings = await snapshot.getPromise(mapSettingsState);

        set(
            mapSettingsState,
            shallow(mapSettings, { imaginaryPoints: filter(it => it.id !== id, mapSettings.imaginaryPoints) })
        );

        mutations.deleteWell(id);
    });

    const addHorizontalBarrel = useRecoilCallback(
        ({ snapshot, set }) =>
            async (wellId: number, plastId: number, point: Point) => {
                const mapSettings = await snapshot.getPromise(mapSettingsState);

                const imgWell = find(it => it.id === wellId && it.plastId === plastId, mapSettings.imaginaryPoints);
                if (imgWell) {
                    let imgPoints = reject(
                        (it: WellPoint) => it.id === wellId && it.plastId === plastId,
                        mapSettings.imaginaryPoints
                    );
                    let changedWell = WellPoint.copyHorizontalBarrel(imgWell, point.x, point.y);

                    set(mapSettingsState, shallow(mapSettings, { imaginaryPoints: append(changedWell, imgPoints) }));

                    mutations.updateWell(changedWell);
                } else {
                    const realWell = find(
                        it => it.id === wellId && it.plastId === plastId,
                        mapSettings.currentFundWithImaginary
                    );
                    if (realWell) {
                        let points = reject(
                            (it: WellPoint) => it.id === wellId && it.plastId === plastId,
                            mapSettings.currentFundWithImaginary
                        );
                        let changedWell = WellPoint.copyHorizontalBarrel(imgWell, point.x, point.y);

                        set(
                            mapSettingsState,
                            shallow(mapSettings, { currentFundWithImaginary: append(changedWell, points) })
                        );

                        mutations.updateWell(changedWell);
                    }
                }
            }
    );

    const removeHorizontalBarrel = useRecoilCallback(({ snapshot, set }) => async (wellId: number) => {
        const mapSettings = await snapshot.getPromise(mapSettingsState);

        const imgWell = find(it => it.id === wellId, mapSettings.imaginaryPoints);
        if (imgWell) {
            let imgPoints = filter(it => it.id !== wellId, mapSettings.imaginaryPoints);
            let changedWell = WellPoint.copyHorizontalBarrel(imgWell, null, null);

            set(mapSettingsState, shallow(mapSettings, { imaginaryPoints: append(changedWell, imgPoints) }));

            mutations.updateWell(changedWell);
        } else {
            const realWell = find(it => it.id === wellId, mapSettings.currentFundWithImaginary);
            if (realWell) {
                let points = filter(it => it.id !== wellId, mapSettings.currentFundWithImaginary);
                let changedWell = WellPoint.copyHorizontalBarrel(imgWell, null, null);

                set(mapSettingsState, shallow(mapSettings, { currentFundWithImaginary: append(changedWell, points) }));

                mutations.updateWell(changedWell);
            }
        }
    });

    const saveAllImaginaryWells = useRecoilCallback(
        ({ snapshot, set }) =>
            async (m: ModifiedImaginaryModel = null, ms: MapSettingModel = null) => {
                const mapSettings = await snapshot.getPromise(mapSettingsState);
                const plastId = await snapshot.getPromise(currentPlastId);
                const well = await snapshot.getPromise(currentSpot);
                const allPlasts = await snapshot.getPromise(addImaginaryModeState);

                const optParametersChanges = await snapshot.getPromise(optimizationParametersChangesState);

                const model = m ? m : await mutations.get();
                const tempMapSettings = ms ? ms : mapSettings;

                if (model.isEmpty && optParametersChanges.isEmpty) {
                    return;
                }

                const response = await saveImaginaryWellsNew(well, plastId, model, optParametersChanges, allPlasts);

                if (!response.data || response.error) {
                    return;
                }

                set(
                    mapSettingsState,
                    shallow(tempMapSettings, {
                        originalImaginaryPoints: tempMapSettings.imaginaryPoints,
                        originalCurrentFundWithImaginary: tempMapSettings.currentFundWithImaginary
                    })
                );

                saveOptimization();

                mutations.clear();
            }
    );

    const saveDefaultPermeabilities = useRecoilCallback(({ snapshot, set }) => async () => {
        const well = await snapshot.getPromise(currentSpot);
        const plastId = await snapshot.getPromise(currentPlastId);
        const params = await snapshot.getPromise(paramsState);

        const response = await calculatePermeabilities(plastId, well.prodObjId, params.optimizeBL, params.tests);

        await savePermeabilities(plastId, well.prodObjId, params.optimizeBL, params.tests, params.stepSize);

        set(dataState, response.data);
    });

    const calculateInterwellConnections = useRecoilCallback(
        ({ snapshot, set, refresh }) =>
            async (model: InterwellsCalculationParams) => {
                const mapSettings = await snapshot.getPromise(mapSettingsState);
                const plastId = await snapshot.getPromise(currentPlastId);
                const scenarioId = await snapshot.getPromise(currentScenarioId);
                const mode = await snapshot.getPromise(calculationModeState);

                // сохранение начальных параметров ОФП проницаемости
                await saveDefaultPermeabilities();

                // Сохранение виртуальных скважин перед расчетом межскваженных соединений
                await saveAllImaginaryWells();

                const tempMapSettings = shallow(mapSettings, {
                    originalImaginaryPoints: mapSettings.imaginaryPoints,
                    originalCurrentFundWithImaginary: mapSettings.currentFundWithImaginary
                });

                set(interwellsIsLoadingState, true);

                const isImprovement = mode === CalculationModeEnum.Improvement;

                const responseConnections = await calculationInterwellConnections(
                    scenarioId,
                    plastId,
                    model,
                    isImprovement
                );
                const responseIntermediate = await intermediateWells(scenarioId, plastId);

                set(
                    mapSettingsState,
                    shallow(tempMapSettings, {
                        interwellConnections: responseConnections.data,
                        intermediatePoints: getIntermediateImaginaryWells(responseIntermediate.data)
                    })
                );

                set(interwellsIsLoadingState, false);

                refresh(mapSettingsState);
                refresh(geologicalReservesSettings);
            }
    );

    const deleteInterwellConnections = useRecoilCallback(({ snapshot, set, refresh }) => async () => {
        const mapSettings = await snapshot.getPromise(mapSettingsState);
        const plastId = await snapshot.getPromise(currentPlastId);
        const scenarioId = await snapshot.getPromise(currentScenarioId);

        const response = await removeInterwellConnections(scenarioId, plastId);

        if (!response.data || response.error) {
            return;
        }

        set(
            mapSettingsState,
            shallow(mapSettings, {
                interwellConnections: [],
                intermediatePoints: []
            })
        );

        refresh(mapSettingsState);
        refresh(geologicalReservesSettings);
    });

    const addWellGroup = useRecoilCallback(({ snapshot, set, refresh }) => async (wells: number[]) => {
        const mapSettings = await snapshot.getPromise(mapSettingsState);
        const plastId = await snapshot.getPromise(currentPlastId);
        const scenarioId = await snapshot.getPromise(currentScenarioId);
        const selectedPolygon = await snapshot.getPromise(selectedPolygonState);

        const isCalcGroup = true;
        const id = nextId(isCalcGroup, mapSettings.wellGroup);

        const newGroup: WellGroup[] = [
            {
                id,
                inAdd: true,
                isCalcGroup,
                wells,
                polygon: map(it => [it.x, it.y], selectedPolygon)
            }
        ];

        set(isLoadingWellGroupState, true);

        set(mapSettingsState, shallow(mapSettings, { wellGroup: append(newGroup[0], mapSettings.wellGroup) }));
        set(selectedPolygonState, []);
        set(togglePolygonState, false);

        await saveWellGroup(newGroup, scenarioId, plastId, true);

        set(isLoadingWellGroupState, false);

        refresh(geologicalReservesSettings);

        refetchAdaptationWellGroup();
    });

    const removeWellGroup = useRecoilCallback(({ snapshot, set }) => async () => {
        const mapSettings = await snapshot.getPromise(mapSettingsState);
        const scenarioId = await snapshot.getPromise(currentScenarioId);

        await deleteWellGroup(scenarioId);

        set(mapSettingsState, shallow(mapSettings, { wellGroup: [] }));

        refetchAdaptationWellGroup();
    });

    const updateOptimisationPresureZab = useRecoilCallback(
        ({ snapshot, set }) =>
            async (model: UpdateOptimisationModel) => {
                const plastId = await snapshot.getPromise(currentPlastId);
                const optParameters = await snapshot.getPromise(optimizationParametersState);

                let opt = find(
                    it => it.wellId === model.wellId && it.wellType === model.wellType,
                    optParameters.optimisation
                );

                let values = reject(
                    (it: OptimisationModel) => it.wellId === model.wellId && it.wellType === model.wellType,
                    optParameters.optimisation
                );

                if (opt) {
                    const value = OptimisationModel.copy(opt, model);
                    values.push(value);
                    alterOptPresureZab(value);
                } else {
                    const defaultOpt = optimisationData(
                        optParameters,
                        OptimisationParamEnum.PresureZab,
                        model.wellId,
                        model.wellType
                    );

                    const value = OptimisationModel.copyWithPlast(defaultOpt, model, plastId);
                    values.push(value);
                    alterOptPresureZab(value);
                }

                set(optimizationParametersState, shallow(optParameters, { optimisation: values }));
            }
    );

    const updateOptimisationSkinFactor = useRecoilCallback(
        ({ snapshot, set }) =>
            async (wellId: number, newValue: OptimisationSkinFactorModel[]) => {
                const optParameters = await snapshot.getPromise(optimizationParametersState);

                const values = reject(
                    (it: OptimisationSkinFactorModel) => it.wellId === wellId,
                    optParameters.optimisationSkinFactor
                );

                alterOptSkinFactor(newValue);

                set(
                    optimizationParametersState,
                    shallow(optParameters, { optimisationSkinFactor: values.concat(newValue) })
                );
            }
    );

    const saveOptimization = useRecoilCallback(({ snapshot, set, reset, refresh }) => async () => {
        const optParameters = await snapshot.getPromise(optimizationParametersState);

        set(
            optimizationParametersState,
            shallow(optParameters, {
                originalOptimisation: optParameters.optimisation,
                originalOptimisationSkinFactor: optParameters.optimisationSkinFactor
            })
        );

        refresh(optimizationParametersRefresher);

        reset(optimizationParametersChangesState);
    });

    // const renameWellOptimization = useRecoilCallback(({ snapshot, set }) => async (oilWellId: number, newWellId: number) => {
    //     if (!oilWellId || !newWellId) {
    //         return;
    //     }

    //     await postRenameWellOptimization(oilWellId, newWellId, scenarioId, subScenarioId, plastId);
    // });

    const saveAquifer = useRecoilCallback(({ snapshot, set, refresh }) => async () => {
        const mapSettings = await snapshot.getPromise(mapSettingsState);
        const plastId = await snapshot.getPromise(currentPlastId);
        const well = await snapshot.getPromise(currentSpot);
        const indentWaterOilContact = await snapshot.getPromise(indentWaterOilContactState);

        set(aquiferIsLoadingState, true);

        const { data } = await postSaveAquifer(well, plastId, indentWaterOilContact);

        set(mapSettingsState, shallow(mapSettings, { aquifers: data }));

        set(aquiferIsLoadingState, false);

        refresh(mapSettingsState);
    });

    const removeAquifer = useRecoilCallback(({ snapshot, set, refresh }) => async () => {
        const mapSettings = await snapshot.getPromise(mapSettingsState);
        const plastId = await snapshot.getPromise(currentPlastId);
        const well = await snapshot.getPromise(currentSpot);

        const { data } = await postRemoveAquifer(well, plastId);

        if (data) {
            set(mapSettingsState, shallow(mapSettings, { aquifers: [], interwellConnections: [] }));

            refresh(mapSettingsState);
        }
    });

    const saveCurrentGeologicalReserves = useRecoilCallback(({ snapshot, set, refresh }) => async () => {
        const plastId = await snapshot.getPromise(currentPlastId);
        const well = await snapshot.getPromise(currentSpot);
        const currentVolumeReservoir = await snapshot.getPromise(currentVolumeReservoirState);

        set(geologicalReservesIsLoadingState, true);

        const { data } = await postSaveCurrentGeologicalReserves(well, plastId, currentVolumeReservoir);

        if (data) {
            refresh(geologicalReservesSettings);
        }

        set(geologicalReservesIsLoadingState, false);
    });

    return {
        backToOriginalData,
        addNewVirtualWell,
        changeWellPosition,
        updateVirtualWell,
        removeVirtualWell,
        addHorizontalBarrel,
        removeHorizontalBarrel,
        saveAllImaginaryWells,
        calculateInterwellConnections,
        deleteInterwellConnections,
        addWellGroup,
        removeWellGroup,
        updateOptimisationPresureZab,
        updateOptimisationSkinFactor,
        saveOptimization,
        saveAquifer,
        removeAquifer,
        saveCurrentGeologicalReserves
    };
}
