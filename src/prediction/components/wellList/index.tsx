import React, { FC, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { rowsScenarios } from '../../../common/components/wellRoster/dataManager';
import { WellRoster } from '../../../common/components/wellRoster/wellRoster';
import { WellBrief } from '../../../common/entities/wellBrief';
import { WellModel } from '../../../common/entities/wellModel';
import { makeWellFromSearch } from '../../../common/helpers/routers/query';
import { currentSpot } from '../../store/well';
import { wellListState } from '../../store/wellList';
import { useWellMutations } from '../../store/wellMutations';

import dict from '../../../common/helpers/i18n/dictionary/main.json';

export const WellList = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const list = useRecoilValue(wellListState);
    const spot = useRecoilValue(currentSpot);

    const wellMutations = useWellMutations();

    useEffect(() => {
        wellMutations.set(makeWellFromSearch(location.search));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onClickHandler = (w: WellBrief) => {
        wellMutations.set(new WellBrief(w.oilFieldId, null, w.prodObjId, null, w.scenarioId));
    };

    return (
        <WellRoster
            clicks={{ scenario: onClickHandler }}
            makeRows={rowsScenarios}
            selected={[new WellBrief(spot.oilFieldId, null, spot.prodObjId, null, spot.scenarioId)]}
            wells={list as unknown as WellModel[]}
            title={t(dict.wellList.scenario)}
            expandOnlySelectedNode
        />
    );
};
