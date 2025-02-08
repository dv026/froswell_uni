/* eslint-disable @typescript-eslint/no-explicit-any */
import * as R from 'ramda';

import { WellModel } from '../../common/entities/wellModel';
import { WellPointRaw, WellPointWithPlast } from '../../common/entities/wellPoint';
import { WellTypeEnum } from '../../common/enums/wellTypeEnum';
import { fnAsIs } from '../../common/helpers/ramda';
import {
    AdaptationINSIM,
    InitialTransmissibility,
    NeighborINSIM,
    NeighborTypeEnum,
    AdaptationDateINSIM
} from '../entities/insim/well';
import { NeighborModel } from '../entities/neighborModel';
import { PlastModel } from '../entities/plastModel';
import { NeighborCoefficientsModel } from '../entities/wellCoefficientsModel';
import { BestAdaptationEnum } from '../subModules/calculation/enums/bestAdaptationEnum';

export const joinNames = (a: string, b: string): string => `${a} - ${b}`;

const nameOrId = (plasts: PlastModel[], plastId: number): string =>
    R.ifElse(
        R.any((x: PlastModel) => x.id === plastId),
        x => R.find<PlastModel>((x: PlastModel) => x.id === plastId)(x).name,
        () => plastId.toString()
    )(plasts);

export const joinNameAndPlast = (
    wellName: string,
    neighbor: NeighborCoefficientsModel | NeighborModel,
    plasts: PlastModel[]
): string =>
    R.ifElse(
        R.isNil,
        R.always(`${wellName} "-"`),
        () => `${wellName} - ${neighbor.name} (${nameOrId(plasts, neighbor.plastId)})`
    )(neighbor);

/**
 * Преобразует серверное представление угла в представление угла на радаре (12-часов, по часовой стрелке)
 * ЕСЛИ(
 *      (C2*(-1)+450)>360;
 *      (C2*(-1)+450)-360;
 *      (C2*(-1)+450))
 */
const turn = 450;
const negativeAngle = x => -1 * x;
const withTurn = x => negativeAngle(x) + turn;

export const radarAngle = (x: number): number =>
    R.ifElse(
        x => withTurn(x) > 360,
        x => withTurn(x) - 360,
        withTurn
    )(x);

const mapNeighborInsim = (
    raw: NeighborINSIM,
    transmissibility: InitialTransmissibility,
    neighbors: NeighborModel[]
): NeighborCoefficientsModel => {
    let n = new NeighborCoefficientsModel();
    const neighbor = R.find(x => x.wellId === raw.wellId, neighbors || []);

    n.wellId = raw.wellId;
    n.id = raw.id;
    n.name = !!neighbor ? neighbor.name : '';
    n.plastId = raw.plastId;
    n.transmissibility = transmissibility.before;
    n.conductivity = [transmissibility.after];

    return n;
};

const findTransmissibility = (plastId: number, wellId: number, initialTransmissibilities: InitialTransmissibility[]) =>
    R.find(y => y.plastId === plastId && y.wellId === wellId, initialTransmissibilities);

// TODO: типизация
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const propGetFn = (bestBy: BestAdaptationEnum): ((x: any) => boolean) =>
    bestBy === BestAdaptationEnum.ByOil ? x => x.bestOil : x => x.bestPressure;

export const neighborsFromInsim = (
    adaptations: AdaptationINSIM[],
    bestAdaptation: BestAdaptationEnum,
    neighbors: NeighborModel[] = null
): NeighborCoefficientsModel[] => {
    const n = R.reject(
        (x: NeighborINSIM) => isAquifer(x.type),
        R.isEmpty(adaptations) ? [] : adaptations[0].defaultNeighbors()
    );
    // const current = R.find<AdaptationINSIM>(propGetFn(bestAdaptation), adaptations);
    const current = adaptations[0];

    return R.map(
        x =>
            mapNeighborInsim(
                x,
                findTransmissibility(x.plastId, x.wellId, current.initialTransmissibilities),
                neighbors
            ),
        n
    );
};

export const isAquifer = (type: NeighborTypeEnum): boolean => type !== NeighborTypeEnum.Well;

export const aquiferTitleByType = (type: NeighborTypeEnum): string => {
    const shapeSector = (x: number) => `Аквифер (законтурная вода, сектор ${x})`;
    switch (type) {
        case NeighborTypeEnum.Underwater:
            return 'Аквифер (подошвенная вода)';
        case NeighborTypeEnum.Sector1:
            return shapeSector(1);
        case NeighborTypeEnum.Sector2:
            return shapeSector(2);
        case NeighborTypeEnum.Sector3:
            return shapeSector(3);
        case NeighborTypeEnum.Sector4:
            return shapeSector(4);
        case NeighborTypeEnum.Sector5:
            return shapeSector(5);
        case NeighborTypeEnum.Sector6:
            return shapeSector(6);
        default:
            return '';
    }
};

export const joinPlasts = (plasts: PlastModel[], dates: AdaptationDateINSIM[]): PlastModel[] =>
    R.innerJoin<PlastModel, number>(
        (plast, id) => plast.id === id,
        plasts,
        R.uniq(R.flatten(R.map(x => R.map<NeighborINSIM, number>(y => y.plastId, x.neighbors), dates)))
    );

// текущая скважина
// + скважины-соседи
// + imaginary скважины (для INSIM)
// TODO: исправить типы
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const allWells = (neighbors: NeighborModel[], w: any, isInsim: boolean, imaginaryWells: WellPointRaw[]): any[] =>
    R.concat(
        R.prepend(w, neighbors), // добавить текущую точку к списку скважин-соседей
        isInsim ? imaginaryWells : []
    );

// скважины-соседи
export const neighbors = (
    isInsim: boolean,
    neighbors: NeighborModel[],
    adaptations: AdaptationINSIM[],
    bestAdaptationINSIM: BestAdaptationEnum,
    coefficientNeighbors: NeighborModel[]
): NeighborModel[] =>
    R.innerJoin<NeighborModel, NeighborModel | NeighborCoefficientsModel>(
        (neighbor, coefficient) => neighbor.id === coefficient.id,
        neighbors,
        isInsim ? neighborsFromInsim(adaptations, bestAdaptationINSIM) : coefficientNeighbors
    );

// получить только imaginary скважины (актуально для INSIM модели)
// из всех точек скважин, полученных с сервера, убрать такие
// - у которых wellId есть в скважинах-соседях
// - текущую скважину
export const imaginaryWells = (
    currentWellId: number,
    uniquePoints: WellPointRaw[],
    neighbors: NeighborModel[]
): WellPointRaw[] =>
    R.pipe(
        R.reject((x: WellPointRaw) => R.any(y => y.wellId === x.wellId, neighbors)),
        R.reject((x: WellPointRaw) => x.wellId === currentWellId)
    )(uniquePoints);

// получить все уникальные связки { wellId, plastId } для скважин-соседей
export const uniqueNeighbors = (
    isInsim: boolean,
    source: NeighborINSIM[] | NeighborCoefficientsModel[]
): { wellId: number; plastId: number }[] =>
    isInsim
        ? R.map(x => ({ wellId: x.wellId, plastId: x.plastId }), source as NeighborINSIM[])
        : R.map(x => ({ wellId: x.wellId, plastId: x.plastId }), source as NeighborCoefficientsModel[]);

export const uniquePoints = (
    isInsim: boolean,
    points: WellPointRaw[],
    source: NeighborINSIM[] | NeighborCoefficientsModel[]
): WellPointRaw[] =>
    R.innerJoin(
        (raw, unq) => raw.wellId === unq.wellId && raw.plastId === unq.plastId,
        points,
        uniqueNeighbors(isInsim, source)
    );

// вычислить пласт, который будет отображаться при первоначальном открытии карты
export const currentPlast = (currentWellId: number, uniquePoints: WellPointRaw[]): number =>
    R.pipe(
        R.reject((x: WellPointRaw) => x.wellId === currentWellId), // исключить точку текущей скважины
        R.map((x: WellPointRaw) => x.plastId), // выбрать все Ид пластов у скважин-соседей
        R.uniq, // убрать повторяющиеся
        x => x[0] // выбрать первый
    )(uniquePoints);

// текущая скважина
export const makeCurrentWellPoint = (currentWell: WellModel, points: WellPointRaw[]): unknown => ({
    name: currentWell.name,
    type: currentWell.charWorkId === 1 ? WellTypeEnum.Oil : WellTypeEnum.Injection,
    plastId: 0,
    wellId: currentWell.id,
    x: R.find(x => x.wellId === currentWell.id, points).x,
    y: R.find(x => x.wellId === currentWell.id, points).y
});

export const fillPoints = (neighbors: NeighborModel[], points: WellPointRaw[]): WellPointWithPlast[] =>
    // TODO: добавить типизацию
    // + исправить "некрасивую" логику по определению координат текущей скважины
    R.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (x: any) =>
            new WellPointWithPlast(
                x.wellId,
                x.plastId === 0 ? x.x : getCoordX(x.wellId, x.plastId, points),
                x.plastId === 0 ? x.y : getCoordY(x.wellId, x.plastId, points),
                x.type || WellTypeEnum.Unknown,
                x.plastId,
                R.isNil(x.type) ? `[${x.wellId}]` : x.name
            ), // type не определен в том случае, если скважина - imaginary
        neighbors
    );

const nilError = (wellId, plastId) => {
    throw new Error(`couldn't find a point for well = [${wellId}] and plast = [${plastId}]`);
};

const zeroIfInf = (x: number) => R.ifElse(x => x === Infinity, R.always(0), fnAsIs)(x);
const getCoord = (wellId: number, plastId: number, points: WellPointRaw[], coord: 'x' | 'y'): number =>
    R.tryCatch(R.prop<'x' | 'y', number>(coord as any), () => nilError(wellId, plastId))(
        R.find(x => x.wellId === wellId && (plastId === 0 ? true : x.plastId === zeroIfInf(plastId)), points) as any
    );
const getCoordX = (wellId: number, plastId: number, neighbors: WellPointRaw[]) =>
    getCoord(wellId, plastId, neighbors, 'x');
const getCoordY = (wellId: number, plastId: number, neighbors: WellPointRaw[]) =>
    getCoord(wellId, plastId, neighbors, 'y');
