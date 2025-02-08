import { InterwellSign, PlastSign, RegionSign, Sign, WellSign } from 'calculation/entities/note';
import { always, cond, T } from 'ramda';

export const stringify = (target: Sign): string =>
    // TODO: на данный момент порядок важен, необходимо продумать логику
    cond([
        [isInterwell, shapeInterwell],
        [isWell, shapeWell],
        [isRegion, shapeRegion],
        [isPlast, shapePlast],
        [T, always('')]
    ])(target);

const isInterwell = (target: any): target is InterwellSign =>
    target.wellId > 0 && target.neighborId >= 0 && target.plastId > 0;

const isWell = (target: any): target is WellSign => target.wellId > 0 && target.plastId > 0;

const isPlast = (target: any): target is PlastSign => target.plastId > 0;

const isRegion = (target: any): target is RegionSign => target.plastId > 0 && target.id > 0;

const shapeInterwell = (interwell: InterwellSign) =>
    `[${interwell.plastId}] ${interwell.wellId} -> ${interwell.neighborId}`;

const shapeWell = (well: WellSign) => `[${well.plastId}] ${well.wellId}`;

const shapePlast = (plast: PlastSign) => `[${plast.plastId}]`;

const shapeRegion = (region: RegionSign) => `[${region.plastId}] RegionId=${region.id}`;
