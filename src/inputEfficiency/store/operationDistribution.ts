import { KeyValue } from 'common/entities/keyValue';
import { groupByProp } from 'common/helpers/ramda';
import { CumulativeEffectModel } from 'commonEfficiency/entities/cumulativeEffectModel';
import { OperationDistributionModel } from 'commonEfficiency/entities/operationDistributionModel';
import { forEachObjIndexed, head, map, sortBy, sum, reverse } from 'ramda';
import { atom, selector } from 'recoil';

import { mapSettingsState } from './mapSettings';

export const operationsSelector = selector<CumulativeEffectModel[]>({
    key: 'inputEfficiency__operationsSelector',
    get: async ({ get }) => {
        const mapSettings = get(mapSettingsState);

        let result = [];

        forEachObjIndexed((group: OperationDistributionModel[]) => {
            result.push({
                operationId: head(group)?.operationId,
                operationName: head(group)?.operationName,
                value: sum(map(x => x.effectiveOilMonth, group))
            });
        }, groupByProp('operationId', mapSettings?.operationDistribution ?? []));

        result = sortBy(x => x.value, result);

        return reverse(
            map(it => ({ operationId: it.operationId, operationName: it.operationName, value: it.value }), result)
        );
    }
});

export const selectedOperationState = atom<KeyValue[]>({
    key: 'inputEfficiency__selectedOperationState',
    default: selector({
        key: 'inputEfficiency__selectedOperationSelector',
        get: async ({ get }) => {
            const operations = get(operationsSelector);

            return map(it => new KeyValue(it.operationId, it.operationName), operations);
        }
    })
});
