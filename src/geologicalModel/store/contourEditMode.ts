import { Point } from 'common/entities/canvas/point';
import { atom } from 'recoil';

export const contourEditModeState = atom<boolean>({
    key: 'geologicalModel__contourEditModeState',
    default: false
});

export const togglePolygonState = atom<boolean>({
    key: 'geologicalModel__togglePolygonState',
    default: false
});

export const selectedPolygonState = atom<Point[]>({
    key: 'geologicalModel__selectedPolygonState',
    default: []
});

export const changingPolygonState = atom<boolean>({
    key: 'geologicalModel__changingPolygonState',
    default: false
});
