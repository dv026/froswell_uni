import { map } from 'ramda';
import { atom, selector } from 'recoil';

import { WellModel } from '../../common/entities/wellModel';
import { getWellList } from '../../common/gateway';
import { isNullOrEmpty, shallow } from '../../common/helpers/ramda';

const shapeList = (raw): WellModel[] =>
    map(
        x =>
            shallow<WellModel>(x, {
                name: isNullOrEmpty(x.name) ? x.id.toString() : x.name
            }),
        raw || []
    );

const wellList = selector<WellModel[]>({
    key: 'geologicalModel__wellList',
    get: async () => {
        const { data } = await getWellList();
        return shapeList(data);
    }
});

export const wellListState = atom<WellModel[]>({
    key: 'geologicalModel__wellListState',
    default: wellList
});
