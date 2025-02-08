import React, { useEffect } from 'react';

import { RouteEnum } from 'common/enums/routeEnum';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { rowsRecords } from '../../common/components/wellRoster/dataManager';
import { WellRoster } from '../../common/components/wellRoster/wellRoster';
import { WellBrief } from '../../common/entities/wellBrief';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { makeWellFromSearch } from '../../common/helpers/routers/query';
import * as router from '../../common/helpers/routers/router';
import { selectedWellsState } from '../../input/store/selectedWells';
import { currentSpot } from '../store/well';
import { wellListState } from '../store/wells';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const WellList = () => {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const location = useLocation();

    const wells = useRecoilValue(wellListState);

    const [spot, setSpot] = useRecoilState(currentSpot);
    const [selectedWells, setSelectedWells] = useRecoilState(selectedWellsState);

    const resetSelectedWells = useResetRecoilState(selectedWellsState);

    useEffect(() => {
        setSpot(makeWellFromSearch(location.search));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setWell = (well: WellBrief) => {
        setSpot(well);
        resetSelectedWells();

        navigate(router.to(RouteEnum.Filtration, well));
    };

    if (!spot) {
        return null;
    }

    return (
        <WellRoster
            expandOnlySelectedNode
            makeRows={rowsRecords}
            multipleSelection
            onSelectedWells={setSelectedWells}
            title={t(dict.wellList.oilfield)}
            wells={wells}
            clicks={{
                well: setWell,
                productionObject: setWell,
                oilfield: setWell
            }}
            selected={
                isNullOrEmpty(selectedWells)
                    ? [new WellBrief(spot.oilFieldId, spot.id, spot.prodObjId, spot.charWorkId)]
                    : selectedWells
            }
        />
    );
};
