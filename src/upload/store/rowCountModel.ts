import { isNil } from 'ramda';
import { atom, selector } from 'recoil';

import { shallow } from '../../common/helpers/ramda';
import { RowCountModel } from '../entities/rowCountModel';
import { fillPercentSelector } from './fillPercent';

const loader = (mark: boolean, count: number) => {
    return mark ? (isNil(count) ? 0 : count) : null;
};

const rowCountModelState = atom<RowCountModel>({
    key: 'upload__rowCountModelState',
    default: {
        rowCountAll: null,
        rowCountMer: null,
        rowCountRigis: null,
        rowCountPerforation: null,
        rowCountResearch: null,
        rowCountGrids: null,
        rowCountRepairs: null,
        rowCountPlastCrossing: null,
        rowCountPlastContours: null,
        rowCountObjectContours: null,
        rowCountPhysicalProperties: null,
        rowCountGeologicalProperties: null,
        rowCountPermeability: null,
        isLoading: false,
        error: null
    }
});

export const rowCountModelSelector = selector<RowCountModel>({
    key: 'upload__rowCountModelSelector',
    get: ({ get }) => {
        const status = get(fillPercentSelector);
        const model = get(rowCountModelState);

        return shallow(model, {
            rowCountMer: loader(status.mer, model.rowCountMer),
            rowCountRigis: loader(status.rigis, model.rowCountRigis),
            rowCountPerforation: loader(status.perforation, model.rowCountPerforation),
            rowCountResearch: loader(status.research, model.rowCountResearch),
            rowCountGrids: loader(status.grids, model.rowCountGrids),
            rowCountRepairs: loader(status.repairs, model.rowCountRepairs),
            rowCountPlastCrossing: loader(status.plastCrossing, model.rowCountPlastContours),
            rowCountPlastContours: loader(status.plastContours, model.rowCountPlastContours),
            rowCountObjectContours: loader(status.objectContours, model.rowCountObjectContours),
            rowCountPhysicalProperties: loader(status.physicalProperties, model.rowCountPhysicalProperties),
            rowCountGeologicalProperties: loader(status.geologicalProperties, model.rowCountGeologicalProperties),
            rowCountPermeability: loader(status.permeabilities, model.rowCountPermeability)
        });
    },
    set: ({ set }, value: RowCountModel) => {
        set(rowCountModelState, value);
    }
});
