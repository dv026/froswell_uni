import React, { useEffect } from 'react';

import { Flex } from '@chakra-ui/react';
import { krigingVariationLossesState } from 'input/store/map/krigingVariationLosses';
import { currentSpot } from 'input/store/well';
import { useWellMutations } from 'input/store/wellMutations';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';

import { rowsRecords } from '../../common/components/wellRoster/dataManager';
import { WellRoster } from '../../common/components/wellRoster/wellRoster';
import { WellBrief } from '../../common/entities/wellBrief';
import { RouteEnum } from '../../common/enums/routeEnum';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { makeWellFromSearch } from '../../common/helpers/routers/query';
import { chartCompareState } from '../store/chart/chartCompare';
import { selectedWellsState } from '../store/selectedWells';
import { tabletSettingsState } from '../store/tablet/tablet';
import { wellListState } from '../store/wells';

import dict from '../../common/helpers/i18n/dictionary/main.json';

export const WellList = () => {
    const { t } = useTranslation();

    const location = useLocation();
    const navigate = useNavigate();

    const wells = useRecoilValue(wellListState);
    const spot = useRecoilValue(currentSpot);

    const [selectedWells, setSelectedWells] = useRecoilState(selectedWellsState);

    const resetSelectedWells = useResetRecoilState(selectedWellsState);
    const resetTabletSettingsState = useResetRecoilState(tabletSettingsState);
    const resetCompareType = useResetRecoilState(chartCompareState);
    const resetKrigingVariationLosses = useResetRecoilState(krigingVariationLossesState);

    const wellMutation = useWellMutations();

    useEffect(() => {
        wellMutation.set(makeWellFromSearch(location.search));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isNullOrEmpty(wells)) {
            navigate(RouteEnum.Upload);
        }
    }, [navigate, wells]);

    const setWell = (well: WellBrief) => {
        wellMutation.set(well);

        resetSelectedWells();
        resetTabletSettingsState();
        resetCompareType();

        if (spot.oilFieldId !== well.oilFieldId || spot.prodObjId !== well.prodObjId) {
            resetKrigingVariationLosses();
        }
    };

    if (!spot) {
        return null;
    }

    return (
        <Flex height={'100%'}>
            <WellRoster
                multipleSelection={true}
                title={t(dict.wellList.oilfield)}
                wells={wells}
                expandOnlySelectedNode
                makeRows={rowsRecords}
                onSelectedWells={setSelectedWells}
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
        </Flex>
    );
};
