import React, { FC } from 'react';

import { any, flatten, forEach, mapObjIndexed } from 'ramda';
import { useRecoilValue } from 'recoil';

import { BreadcrumbGroups } from '../../../../common/components/breadcrumbControl/breadcrumbGroups';
import { rowsPrediction } from '../../../../common/components/wellRoster/dataManager';
import { Item, RosterItemEnum } from '../../../../common/components/wellRoster/itemEntity';
import { WellBrief } from '../../../../common/entities/wellBrief';
import { PredictionListWell } from '../../../../common/entities/wellModel';
import { groupByProp, isNullOrEmpty } from '../../../../common/helpers/ramda';
import { currentSpot } from '../../../store/well';
import { wellListForResults } from '../../../store/wellList';
import { selectedWellsState } from '../store/selectedWells';

export const Breadcrumb = () => {
    const wells = useRecoilValue(wellListForResults);
    const selectedWells = useRecoilValue(selectedWellsState);
    const well = useRecoilValue(currentSpot);

    const selected = isNullOrEmpty(selectedWells) ? [well] : selectedWells;

    return <BreadcrumbGroups items={groupItems(wells, selected)} />;
};

const groupItems = (wells: PredictionListWell[], selected: WellBrief[]) => {
    const result = [];

    const tree = rowsPrediction(wells);

    mapObjIndexed(group => {
        const res = [];

        itemInner(res, tree, group);

        result.push(flatten(res));
    }, groupByProp('oilFieldId', selected));

    return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const itemInner = (result: any[], items: Item<any>[], selected: WellBrief[]) => {
    if (isNullOrEmpty(items)) {
        return;
    }

    const res = [];

    forEach(item => {
        if (any(it => item.type === RosterItemEnum.Oilfield && it.oilFieldId === item.id.oilFieldId, selected)) {
            res.push(item.name);
        } else if (
            any(it => item.type === RosterItemEnum.ProductionObject && it.prodObjId === item.id.prodObjId, selected)
        ) {
            res.push(item.name);
        } else if (any(it => item.type === RosterItemEnum.Scenario && it.scenarioId === item.id.scenarioId, selected)) {
            res.push(item.name);
        } else if (
            any(it => item.type === RosterItemEnum.SubScenario && it.subScenarioId === item.id.subScenarioId, selected)
        ) {
            res.push(item.name);
        } else if (
            any(
                it =>
                    item.type === RosterItemEnum.Well &&
                    it.id === item.id.id &&
                    it.prodObjId === item.id.prodObjId &&
                    it.scenarioId === item.id.scenarioId &&
                    it.subScenarioId === item.id.subScenarioId,
                selected
            )
        ) {
            res.push(item.name);
        }

        itemInner(res, item.subs, selected);
    }, items);

    if (!isNullOrEmpty(res)) {
        const nested = any(it => Array.isArray(it), res);
        result.push(nested ? res : [res.join(', ')]);
    }
};
