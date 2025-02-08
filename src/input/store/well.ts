import { CharWorkEnum } from 'common/enums/charWorkEnum';
import { RouteEnum } from 'common/enums/routeEnum';
import { appRouter } from 'common/helpers/history';
import { equals, find, isNil } from 'ramda';
import { atom, selector, selectorFamily } from 'recoil';

import { WellBrief } from '../../common/entities/wellBrief';
import { WellModel } from '../../common/entities/wellModel';
//import { RouteEnum } from '../../common/enums/routeEnum';
import { findOrDefault } from '../../common/helpers/ramda';
import * as router from '../../common/helpers/routers/router';
import { wellListState } from './wells';

export const firstWellFromList = (list: WellModel[]): WellBrief =>
    findOrDefault(
        x => !!x.productionObjectId && !!x.id && x.charWorkId !== CharWorkEnum.Piezometric,
        x => new WellBrief(x.oilFieldId, x.id, x.productionObjectId, x.charWorkId),
        null,
        list
    );

export const firstWellByObjFromList = (list: WellModel[], currentWell: WellBrief = null): WellBrief => {
    if (currentWell && currentWell?.prodObjId) {
        return findOrDefault(
            x => !!x.id && currentWell.prodObjId === x.productionObjectId && x.charWorkId !== CharWorkEnum.Piezometric,
            x => new WellBrief(x.oilFieldId, x.id, x.productionObjectId, x.charWorkId),
            null,
            list
        );
    }

    return firstWellFromList(list);
};

export const userWell = atom<WellBrief>({
    key: 'input__userWell',
    default: null,
    effects: [
        ({ onSet }) => {
            onSet(well => {
                let path = appRouter.state.location.pathname;

                if (equals(path, RouteEnum.Home)) {
                    path = RouteEnum.Input;
                }

                appRouter.navigate(router.to(path, well));
            });
        }
    ]
});

export const currentSpot = selector<WellBrief>({
    key: 'input__currentSpot',
    get: async ({ get }) => {
        const well = get(userWell);

        if (well) {
            return well;
        }

        // попробовать найти первую скважину в списке
        const list = get(wellListState);

        return firstWellFromList(list);
    }
});

export const wellNameById = selectorFamily({
    key: 'input__wellNameById',
    get:
        (wellId: number) =>
        ({ get }) => {
            const wells = get(wellListState);

            const item = find(it => it.id === wellId && !isNil(it.name), wells ?? []);

            return item?.name;
        }
});
