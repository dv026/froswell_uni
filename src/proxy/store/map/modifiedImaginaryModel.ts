import { any, append, reject } from 'ramda';
import { atom, useRecoilCallback } from 'recoil';

import { shallow } from '../../../common/helpers/ramda';
import { ModifiedImaginaryModel, RenameImaginaryWell } from '../../entities/proxyMap/modifiedImaginaryModel';
import { WellPoint } from '../../entities/proxyMap/wellPoint';

export const modifiedImaginaryState = atom<ModifiedImaginaryModel>({
    key: 'proxyMap__modifiedImaginaryState',
    default: new ModifiedImaginaryModel()
});

export function useImaginaryWellMutations() {
    const get = useRecoilCallback(({ snapshot }) => async () => {
        const model = await snapshot.getPromise(modifiedImaginaryState);

        return model;
    });

    const clear = useRecoilCallback(({ set }) => async () => {
        set(modifiedImaginaryState, new ModifiedImaginaryModel());
    });

    const createWell = useRecoilCallback(({ snapshot, set }) => async (well: WellPoint) => {
        const model = await snapshot.getPromise(modifiedImaginaryState);

        set(modifiedImaginaryState, shallow(model, { added: append(well, model.added) }));
    });

    const updateWell = useRecoilCallback(
        ({ snapshot, set }) =>
            async (well: WellPoint, wellId: number = null, newWellId: number = null) => {
                const model = await snapshot.getPromise(modifiedImaginaryState);

                let added = model.added;
                let modified = reject((it: WellPoint) => it.id === well.id, model.modified);
                let renamed = model.renamed;

                if (any(it => it.id === well.id, added)) {
                    added = append(
                        well,
                        reject((it: WellPoint) => it.id === well.id, added)
                    );
                } else {
                    modified = append(well, modified);
                }

                // переименование скважины
                if (wellId && wellId !== newWellId) {
                    renamed = append(
                        { wellId, newWellId },
                        reject((it: RenameImaginaryWell) => it.wellId === wellId, renamed)
                    );

                    added = reject((it: WellPoint) => it.id === wellId, added);
                    modified = reject((it: WellPoint) => it.id === wellId, modified);
                }

                const newModel = shallow(model, { added, modified, renamed });

                set(modifiedImaginaryState, newModel);

                return newModel;
            }
    );

    const deleteWell = useRecoilCallback(({ snapshot, set }) => async (id: number) => {
        const model = await snapshot.getPromise(modifiedImaginaryState);

        let modified = reject((it: WellPoint) => it.id === id, model.modified);
        let renamed = reject((it: RenameImaginaryWell) => it.wellId === id, model.renamed);

        set(modifiedImaginaryState, shallow(model, { modified, renamed, deleted: append(id, model.deleted) }));
    });

    return {
        get,
        clear,
        createWell,
        updateWell,
        deleteWell
    };
}
