import * as R from 'ramda';

import {
    add,
    couldBeAddedTo,
    isSolderedWithNext,
    isSolderedWithPrev,
    sort
} from '../../../src/proxy/helpers/charworkManager';
import { ImaginaryCharWorkHistory } from '../../../src/proxy/entities/wellGrid/wellPoint';
import { WellTypeEnum } from '../../../src/common/enums/wellTypeEnum';

describe('sort', () => {
    test('should return empty list if null or empty', () => {
        expect(sort(null).length).toBe(0);
    });
});

describe('add', () => {
    const listA = [
        new ImaginaryCharWorkHistory(new Date(2019, 0, 1), new Date(2019, 0, 31), WellTypeEnum.Oil),
        new ImaginaryCharWorkHistory(new Date(2019, 1, 1), new Date(2019, 1, 28), WellTypeEnum.Injection)
    ];

    const listB = [
        new ImaginaryCharWorkHistory(new Date(2019, 0, 1), new Date(2019, 0, 31), WellTypeEnum.Injection),
        new ImaginaryCharWorkHistory(new Date(2019, 1, 1), new Date(2019, 1, 28), WellTypeEnum.Oil)
    ];

    test('should add correct charwork based on last existing', () => {
        const addListA = add(listA);
        const addListB = add(listB);

        expect(R.last(addListA).type).toBe(WellTypeEnum.Injection);
        expect(R.last(addListA).startDate.getDate()).toBe(1);
        expect(R.last(addListA).startDate.getMonth()).toBe(2);
        expect(R.last(addListA).startDate.getFullYear()).toBe(2019);

        expect(R.last(addListB).type).toBe(WellTypeEnum.Oil);
    });

    test('should add oil charwork with current date of start if well has no any charwork', () => {
        const justAdded = R.last(add([]));
        expect(justAdded.type).toBe(WellTypeEnum.Oil);
        expect(justAdded.startDate.getDate()).toBe(new Date().getDate());
        expect(justAdded.startDate.getMonth()).toBe(new Date().getMonth());
        expect(justAdded.startDate.getFullYear()).toBe(new Date().getFullYear());
    });
});

describe('couldBeAddedTo', () => {
    test("should return false if last charwork hasn't been closed yet", () => {
        const listA = [
            new ImaginaryCharWorkHistory(new Date(2019, 0, 1), new Date(2019, 0, 31), WellTypeEnum.Oil),
            new ImaginaryCharWorkHistory(new Date(2019, 1, 1), null, WellTypeEnum.Injection)
        ];

        expect(couldBeAddedTo(listA)).toBe(false);
    });
});

describe('isSolderedWithNext', () => {
    const real = new ImaginaryCharWorkHistory(new Date(2019, 0, 1), null, WellTypeEnum.Oil);
    real.isImaginary = false;
    const virtual = new ImaginaryCharWorkHistory(new Date(2019, 0, 1), new Date(2019, 1, 28), WellTypeEnum.Oil);

    const closedReal = new ImaginaryCharWorkHistory(new Date(2019, 0, 1), new Date(2019, 0, 15), WellTypeEnum.Oil);
    const listA = [real, virtual];
    const listB = [closedReal, virtual];

    test('should return false if list contains less than two elements', () => {
        expect(isSolderedWithNext(0, [])).toBe(false);
        expect(isSolderedWithNext(0, null)).toBe(false);
    });

    test('should return false for imaginary charwork', () => {
        expect(isSolderedWithNext(1, listA)).toBe(false);
    });

    test('should return false if real well has closed charwork', () => {
        expect(isSolderedWithNext(0, listB)).toBe(false);
    });

    test('should return true with correct values', () => {
        expect(isSolderedWithNext(0, listA)).toBe(true);
    });
});

describe('isSolderedWithPrev', () => {
    const real = new ImaginaryCharWorkHistory(new Date(2019, 0, 1), null, WellTypeEnum.Oil);
    real.isImaginary = false;
    const virtual = new ImaginaryCharWorkHistory(new Date(2019, 0, 1), new Date(2019, 1, 28), WellTypeEnum.Oil);

    const closedReal = new ImaginaryCharWorkHistory(new Date(2019, 0, 1), new Date(2019, 0, 15), WellTypeEnum.Oil);
    const listA = [real, virtual];
    const listB = [closedReal, virtual];

    test('should return false if list contains less than two elements', () => {
        expect(isSolderedWithPrev(0, [])).toBe(false);
        expect(isSolderedWithPrev(0, null)).toBe(false);
    });

    test('should return false for imaginary charwork', () => {
        expect(isSolderedWithPrev(1, listA)).toBe(true);
    });

    test('should return false if real well has closed charwork', () => {
        expect(isSolderedWithPrev(1, listB)).toBe(false);
    });

    test('should return true with correct values', () => {
        expect(isSolderedWithPrev(1, listA)).toBe(true);
    });
});
