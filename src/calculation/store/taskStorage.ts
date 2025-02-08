import { filter } from 'ramda';
import { atom, selector } from 'recoil';

import { localStorageEffect } from '../../common/helpers/recoil';
import { isStartedProgress } from '../entities/computation/computationStatus';
import { InsimTaskModel } from '../entities/insimTaskModel';

const isProgress = (storage: InsimTaskModel[]) => filter(it => isStartedProgress(it.status), storage ?? []);

export const taskStorageState = atom<InsimTaskModel[]>({
    key: 'calculation__taskStorageState',
    default: [],
    effects: [localStorageEffect('task_storage')]
});

export const taskStorageInProgress = selector<InsimTaskModel[]>({
    key: 'calculation__taskStorageInProgress',
    get: async ({ get }) => {
        const storage = get(taskStorageState);

        return isProgress(storage);
    }
});
