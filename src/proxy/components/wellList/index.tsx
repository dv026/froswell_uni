import React, { FC, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { rowsObjects } from '../../../common/components/wellRoster/dataManager';
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
    const well = useRecoilValue(currentSpot);

    const wellMutations = useWellMutations();

    useEffect(() => {
        wellMutations.set(makeWellFromSearch(location.search));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <WellRoster
            clicks={{
                productionObject: wellMutations.set
            }}
            makeRows={rowsObjects}
            selected={[new WellBrief(well.oilFieldId, null, well.prodObjId)]}
            wells={list as unknown as WellModel[]}
            title={t(dict.wellList.object)}
            expandOnlySelectedNode
        />
    );
};
