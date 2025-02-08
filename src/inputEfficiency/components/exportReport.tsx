import React from 'react';

import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import { currentSpot } from 'input/store/well';
import { isLoadingExportState } from 'inputEfficiency/store/isLoadingExport';
import { reportExport } from 'proxy/subModules/efficiency/gateways/gateway';
import { useRecoilCallback, useRecoilValueLoadable, useSetRecoilState } from 'recoil';

import { downloadFile } from '../../common/helpers/file';
import { hasValue } from '../../common/helpers/recoil';
import { ExportReportModal } from '../../commonEfficiency/components/exportReportModal';
import { ReportDataTypeEnum, ReportExportModel } from '../../commonEfficiency/entities/exportModel';

export const ExportReport = () => {
    const wellLoadable = useRecoilValueLoadable(currentSpot);

    const setIsLoading = useSetRecoilState(isLoadingExportState);

    const well = hasValue(wellLoadable) ? wellLoadable.contents : [];

    const defaultModel = new ReportExportModel(
        well.scenarioId,
        well.subScenarioId,
        well.prodObjId,
        null,
        true,
        ReportDataTypeEnum.AdaptationPlusPrediction,
        false
    );

    defaultModel.evaluationType = EvaluationTypeEnum.Standart;

    const exportCallback = useRecoilCallback(() => async (model: ReportExportModel) => {
        setIsLoading(true);

        const response = await reportExport(model);

        downloadFile(response);

        setIsLoading(false);
    });

    return <ExportReportModal model={defaultModel} export={exportCallback} />;
};
