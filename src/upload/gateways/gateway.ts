/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosPromise } from 'axios';

import { KeyValue } from '../../common/entities/keyValue';
import {
    axiosGetWithAuth,
    axiosPostWithAuth,
    axiosUploadFiles,
    handleResponsePromise,
    ServerResponse,
    str,
    url
} from '../../common/helpers/serverPath';
import { GeologicalProperties } from '../entities/geologicalProperties';
import { OilFieldProperties } from '../entities/oilFieldProperties';
import { PhysicalProperties } from '../entities/physicalProperties';
import { UploadFillPercent } from '../entities/uploadFillPercent';
import { UploadedBrand } from '../entities/uploadedBrand';
import { UploadedPlast } from '../entities/uploadedPlast';

const controllerName: string = 'upload';

const boolToString = (value: boolean) => (value ? 'true' : 'false');

export const uploadUrl = (actionName: string, opts: Array<string> = [], query: Array<[string, string]> = []): string =>
    url(controllerName, actionName, opts, query);

// GET

export const getOilFields = async (): Promise<ServerResponse<KeyValue[]>> => {
    return handleResponsePromise(axiosGetWithAuth(uploadUrl('upload-oil-fields', [])));
};

export const getOilFieldProperties = async (id: number): Promise<ServerResponse<OilFieldProperties>> => {
    const params: Array<[string, string]> = [['oilfieldId', str(id)]];

    return handleResponsePromise(axiosGetWithAuth(uploadUrl('upload-oil-field-properties', [], params)));
};

export const getUploadedPlasts = async (id: number): Promise<ServerResponse<UploadedPlast[]>> => {
    const params: Array<[string, string]> = [['oilfieldId', str(id)]];

    return handleResponsePromise(axiosGetWithAuth(uploadUrl('uploaded-plasts', [], params)));
};

export const getUploadedWells = async (id: number): Promise<ServerResponse<any>> => {
    const params: Array<[string, string]> = [['oilfieldId', str(id)]];

    return handleResponsePromise(axiosGetWithAuth(uploadUrl('uploaded-wells', [], params)));
};

export const getUploadedFillPercent = async (id: number): Promise<ServerResponse<UploadFillPercent>> => {
    const params: Array<[string, string]> = [['oilfieldId', str(id)]];

    return handleResponsePromise(axiosGetWithAuth(uploadUrl('uploaded-fill-percent', [], params)));
};

export const getUploadedAvailableTools = async (
    oilFieldId: number,
    plastId: number
): Promise<ServerResponse<UploadedBrand[]>> => {
    const params: Array<[string, string]> = [
        ['oilFieldId', str(oilFieldId)],
        ['plastId', str(plastId)]
    ];

    return handleResponsePromise(axiosGetWithAuth(uploadUrl('uploaded-available-tools', [], params)));
};

// POST

export const uploadPhysicalProperties = (model: PhysicalProperties): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(uploadUrl('upload-physical-properties'), { ...model }));
};

export const uploadGeologicalProperties = (model: GeologicalProperties): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(uploadUrl('upload-geological-properties'), { ...model }));
};

export const createOilField = (name: string): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(uploadUrl('upload-create-field'), { name }));
};

export const editOilField = (id: number, name: string): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(uploadUrl('upload-edit-field'), { id, name }));
};

export const removeAllData = (id: number): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(uploadUrl('upload-remove-all-data'), { id }));
};

export const removeOilField = (id: number): Promise<ServerResponse<any>> => {
    return handleResponsePromise(axiosPostWithAuth(uploadUrl('upload-remove-field'), { id }));
};

// UPLOAD

const uploadBase = (path: string, data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> => {
    data.set('clearData', boolToString(clearData));
    data.set('oilFieldId', str(oilFieldId));
    return axiosUploadFiles(uploadUrl(path), data);
};

export const uploadAll = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-all', data, clearData, oilFieldId);

export const uploadMer = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-mer', data, clearData, oilFieldId);

export const uploadRigis = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-rigis', data, clearData, oilFieldId);

export const uploadPerforation = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-perforation', data, clearData, oilFieldId);

export const uploadResearch = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-research', data, clearData, oilFieldId);

export const uploadGrids = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-grids', data, clearData, oilFieldId);

export const uploadRepairs = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-repairs', data, clearData, oilFieldId);

export const uploadPlastCrossing = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-plast-crossing', data, clearData, oilFieldId);

export const uploadPlastContours = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-plast-contours', data, clearData, oilFieldId);

export const uploadObjectContours = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-object-contours', data, clearData, oilFieldId);

export const uploadPermeability = (data: FormData, clearData: boolean, oilFieldId: number): AxiosPromise<any> =>
    uploadBase('upload-permeability', data, clearData, oilFieldId);
