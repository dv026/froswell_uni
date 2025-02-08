import React from 'react';

import { RouteEnum } from 'common/enums/routeEnum';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { rowsObjects } from '../../common/components/wellRoster/dataManager';
import { WellRoster } from '../../common/components/wellRoster/wellRoster';
import * as router from '../../common/helpers/routers/router';
import { currentPlastId } from '../store/plast';
import { currentSpot } from '../store/well';
import { wellListState } from '../store/wells';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const WellList = () => {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const wells = useRecoilValue(wellListState);

    const [well, setWell] = useRecoilState(currentSpot);

    const resetCurrentPlastId = useResetRecoilState(currentPlastId);

    const clickHandler = well => {
        setWell(well);
        resetCurrentPlastId();

        navigate(router.to(RouteEnum.GeologicalModel, well));
    };

    return (
        <WellRoster
            wells={wells}
            clicks={{
                productionObject: clickHandler
            }}
            makeRows={rowsObjects}
            selected={[well]}
            title={t(dict.wellList.oilfield)}
            expandOnlySelectedNode
        />
    );
};
