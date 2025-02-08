/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertStatus, useToast } from '@chakra-ui/react';
import { assoc, head } from 'ramda';
import { useTranslation } from 'react-i18next';
import { useRecoilCallback } from 'recoil';

import { isNullOrEmpty } from '../../common/helpers/ramda';
import { GeologicalProperties } from '../entities/geologicalProperties';
import { PhysicalProperties } from '../entities/physicalProperties';
import { RowCountModel } from '../entities/rowCountModel';
import {
    createOilField,
    editOilField,
    removeAllData,
    removeOilField,
    uploadAll,
    uploadGeologicalProperties,
    uploadGrids,
    uploadMer,
    uploadObjectContours,
    uploadPerforation,
    uploadPermeability,
    uploadPhysicalProperties,
    uploadPlastContours,
    uploadPlastCrossing,
    uploadRepairs,
    uploadResearch,
    uploadRigis
} from '../gateways/gateway';
import { selectedOilField } from './currentOilfield';
import { fillPercentSelector } from './fillPercent';
import { oilFieldPropertiesSelector } from './oilFieldProperties';
import { oilFieldsSelector } from './oilFields';
import { rowCountModelSelector } from './rowCountModel';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export function useUploadMutations() {
    const { t } = useTranslation();
    const toast = useToast();

    const update = useRecoilCallback(
        ({ snapshot, set }) =>
            async <K extends keyof RowCountModel>(key: K, value: RowCountModel[K]) => {
                const model = await snapshot.getPromise(rowCountModelSelector);
                set(rowCountModelSelector, assoc(key, value, model) as RowCountModel);
            }
    );

    const showToast = useRecoilCallback(({ snapshot }) => async (count: number) => {
        const model = await snapshot.getPromise(rowCountModelSelector);

        let title = t(dict.load.downloadResults);
        let message = t(dict.load.totalLinesParam, { value: count });
        let status: AlertStatus = 'success';

        if (model.error) {
            title = t(dict.common.error);
            message = model.error;
            status = 'error';
        }

        toast({
            title: title,
            description: message,
            status: status,
            duration: 5000,
            isClosable: true
        });
    });

    const handleError = useRecoilCallback(() => async (err: any) => {
        if (
            isNullOrEmpty(err.response) ||
            isNullOrEmpty(err.response.data) ||
            isNullOrEmpty(err.response.data.errors)
        ) {
            return;
        }

        update('error', err.response.data.errors['error'][0]);
    });

    const base = useRecoilCallback(
        ({ refresh }) =>
            async (key: any, action: any, data: FormData, clearData: boolean, oilFieldId: number) => {
                action(data, clearData, oilFieldId)
                    .then(response => {
                        update(key, response.data);
                        showToast(response.data);

                        refresh(fillPercentSelector);
                    })
                    .catch(err => handleError(err));
            }
    );

    const all = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountAll', uploadAll, data, clearData, oilFieldId);
    });

    const mer = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountMer', uploadMer, data, clearData, oilFieldId);
    });

    const rigis = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountRigis', uploadRigis, data, clearData, oilFieldId);
    });

    const perforation = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountPerforation', uploadPerforation, data, clearData, oilFieldId);
    });

    const research = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountResearch', uploadResearch, data, clearData, oilFieldId);
    });

    const grids = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountGrids', uploadGrids, data, clearData, oilFieldId);
    });

    const repairs = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountRepairs', uploadRepairs, data, clearData, oilFieldId);
    });

    const plastCrossing = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountPlastCrossing', uploadPlastCrossing, data, clearData, oilFieldId);
    });

    const plastContours = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountPlastContours', uploadPlastContours, data, clearData, oilFieldId);
    });

    const objectContours = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountObjectContours', uploadObjectContours, data, clearData, oilFieldId);
    });

    const permeability = useRecoilCallback(() => async (data: FormData, clearData: boolean, oilFieldId: number) => {
        base('rowCountPermeability', uploadPermeability, data, clearData, oilFieldId);
    });

    const physicalProperties = useRecoilCallback(({ refresh }) => async (model: PhysicalProperties) => {
        const response = await uploadPhysicalProperties(model);

        update('rowCountPhysicalProperties', response.data);

        refresh(fillPercentSelector);
        refresh(oilFieldPropertiesSelector);
    });

    const geologicalProperties = useRecoilCallback(({ refresh }) => async (model: GeologicalProperties) => {
        const response = await uploadGeologicalProperties(model);

        update('rowCountGeologicalProperties', response.data);

        refresh(fillPercentSelector);
        refresh(oilFieldPropertiesSelector);
    });

    const clearAllData = useRecoilCallback(({ refresh }) => async (id: number) => {
        await removeAllData(id);

        refresh(fillPercentSelector);
    });

    const deleteOilField = useRecoilCallback(({ snapshot, set, refresh }) => async (id: number) => {
        const oilFields = await snapshot.getPromise(oilFieldsSelector);

        await removeOilField(id);

        set(selectedOilField, head(oilFields));

        refresh(fillPercentSelector);
    });

    const addOilField = useRecoilCallback(({ set }) => async () => {
        const name = t(dict.common.oilfield);

        const response = await createOilField(name);

        set(selectedOilField, response.data);
    });

    const renameOilField = useRecoilCallback(({ refresh }) => async (id: number, name: string) => {
        await editOilField(id, name);

        refresh(oilFieldsSelector);
    });

    return {
        all,
        mer,
        rigis,
        perforation,
        research,
        grids,
        repairs,
        plastCrossing,
        plastContours,
        objectContours,
        permeability,
        physicalProperties,
        geologicalProperties,
        clearAllData,
        deleteOilField,
        addOilField,
        renameOilField
    };
}
