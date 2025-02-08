import React, { useEffect } from 'react';
import { FC } from 'react';

import { wellListForEfficiency, wellListState } from 'proxy/store/wellList';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { rowsProxy } from '../../../../common/components/wellRoster/dataManager';
import { WellRoster } from '../../../../common/components/wellRoster/wellRoster';
import { WellModel } from '../../../../common/entities/wellModel';
import { makeWellFromSearch } from '../../../../common/helpers/routers/query';
import { repairModeState } from '../../../../commonEfficiency/store/repairMode';
import { currentSpot } from '../../../../proxy/store/well';
import { useWellMutations } from '../../../../proxy/store/wellMutations';

import dict from '../../../../common/helpers/i18n/dictionary/main.json';

export const WellList = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const list = useRecoilValue(wellListForEfficiency);
    const well = useRecoilValue(currentSpot);

    const setRepairMode = useSetRecoilState(repairModeState);

    const wellMutations = useWellMutations();

    useEffect(() => {
        wellMutations.set(makeWellFromSearch(location.search));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onClickByWellHandler = w => {
        wellMutations.set(w);

        setRepairMode(0);
    };

    return (
        <WellRoster
            clicks={{
                well: onClickByWellHandler
            }}
            makeRows={rowsProxy}
            selected={[well]}
            wells={list as unknown as WellModel[]}
            expandOnlySelectedNode
            title={t(dict.common.well)}
        />
    );
};
