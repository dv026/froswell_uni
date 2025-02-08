import React, { FC, useCallback, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { rowsProxy } from '../../../../../common/components/wellRoster/dataManager';
import { WellRoster } from '../../../../../common/components/wellRoster/wellRoster';
import { WellBrief } from '../../../../../common/entities/wellBrief';
import { WellModel } from '../../../../../common/entities/wellModel';
import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { makeWellFromSearch } from '../../../../../common/helpers/routers/query';
import { currentSpot } from '../../../../store/well';
import { wellListForResults } from '../../../../store/wellList';
import { useWellMutations } from '../../../../store/wellMutations';
import { chartCompareState } from '../../store/chartCompare';
import { selectedWellsState } from '../../store/selectedWells';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

export const WellList = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const list = useRecoilValue(wellListForResults);
    const well = useRecoilValue(currentSpot);

    const [selectedWells, setSelectedWells] = useRecoilState(selectedWellsState);

    const resetCompareType = useResetRecoilState(chartCompareState);

    const wellMutations = useWellMutations();

    useEffect(() => {
        wellMutations.set(makeWellFromSearch(location.search));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onClickByScenario = useCallback(
        (w: WellBrief) => {
            wellMutations.set(new WellBrief(w.oilFieldId, null, w.prodObjId, null, w.scenarioId, w.subScenarioId));
            resetCompareType();
        },
        [resetCompareType, wellMutations]
    );

    const onClickByWell = useCallback(
        (w: WellBrief) => {
            wellMutations.set(w);
            resetCompareType();
        },
        [resetCompareType, wellMutations]
    );

    return (
        <WellRoster
            expandOnlySelectedNode
            makeRows={rowsProxy}
            multipleSelection={true}
            onSelectedWells={setSelectedWells}
            selected={isNullOrEmpty(selectedWells) ? [well] : selectedWells}
            title={t(dict.common.well)}
            wells={list as unknown as WellModel[]}
            clicks={{
                well: onClickByWell,
                scenario: onClickByScenario
            }}
        />
    );
};
