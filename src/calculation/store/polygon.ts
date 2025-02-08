import { atom } from 'recoil';

import { Point } from '../../common/entities/canvas/point';

export const togglePolygonState = atom<boolean>({
    key: 'calculation__togglePolygonState',
    default: false
});

export const selectedPolygonState = atom<Point[]>({
    key: 'calculation__selectedPolygonState',
    default: []
});
