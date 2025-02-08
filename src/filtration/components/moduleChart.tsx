import React, { FC } from 'react';

import { filter, isNil, map, mergeRight } from 'ramda';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Spinner } from '../../common/components/spinner';
import { WellTypeEnum } from '../../common/enums/wellTypeEnum';
import { WithDate } from '../../input/entities/merModel';
import { InputParamEnum } from '../enums/inputParamEnum';
import { disabledOilLinesState } from '../store/disabledOilLines';
import { isLoadingState } from '../store/isLoading';
import { kalmanDataState } from '../store/kalmanData';
import { kalmanParamsState } from '../store/kalmanParams';
import { kalmanSavedResultState } from '../store/kalmanSavedResult';
import { showSavedResultState } from '../store/showSavedResult';
import { currentSpot } from '../store/well';
import { ChartProps, FiltrationChart } from './chart';
import { inputParams } from './chart/chartHelper';

export const ModuleChart = () => {
    const isLoading = useRecoilValue(isLoadingState);
    const kalmanData = useRecoilValue(kalmanDataState);
    const kalmanSavedResult = useRecoilValue(kalmanSavedResultState);
    const params = useRecoilValue(kalmanParamsState);
    const showSavedResult = useRecoilValue(showSavedResultState);
    const well = useRecoilValue(currentSpot);

    const [disabledOilLines, setDisabledOilLines] = useRecoilState(disabledOilLinesState);
    const [disabledInjectionLines, setDisabledInjectionLines] = useRecoilState(disabledOilLinesState);

    if (isLoading) {
        return <Spinner show={true} />;
    }

    if (!well || !kalmanData) {
        return null;
    }

    const isInjectionWell = well.charWorkId === WellTypeEnum.Injection;

    const changeDisabledLines = (list: InputParamEnum[]) => {
        if (isNil(well.charWorkId) || well.charWorkId === WellTypeEnum.Oil) {
            setDisabledOilLines(list);
        } else {
            setDisabledInjectionLines(list);
        }
    };

    const getColumns = () =>
        showSavedResult || !well.id
            ? filter(it => !well.charWorkId || it.wellType === well.charWorkId, inputParams)
            : filter(
                  it => (it.key === params.parameter || params.parameter === 'All') && it.wellType === well.charWorkId,
                  inputParams
              );

    const chartSettings: ChartProps = {
        columns: getColumns(),
        data: showSavedResult ? convertDates(kalmanSavedResult) : convertDates(kalmanData),
        disabled: isInjectionWell ? disabledInjectionLines : disabledOilLines,
        onChangeDisabledLines: changeDisabledLines
    };

    return <FiltrationChart key={well.id} {...chartSettings} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertDates = (data: any): WithDate[] => map(x => mergeRight(x, { dt: new Date(x.dt) }) as WithDate, data ?? []);
