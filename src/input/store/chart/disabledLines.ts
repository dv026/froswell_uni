import { atom } from 'recoil';

export const disabledLinesOilState = atom<string[]>({
    key: 'input__disabledLinesOilState',
    default: ['gasVolumeRate']
});

export const disabledLinesInjectionState = atom<string[]>({
    key: 'input__disabledLinesInjectionState',
    default: []
});
