// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CharWorkEnum } from 'common/enums/charWorkEnum';
import * as R from 'ramda';

import { WellBrief } from '../../entities/wellBrief';
import { PredictionListWell, ProxyListWell, WellModel } from '../../entities/wellModel';
import { round1 } from '../../helpers/math';
import { Item, MarkEnum, RosterItemEnum, WellRecord, WithWellType } from './itemEntity';

export const rowsPrediction = (list: PredictionListWell[]): Item<WithWellType | null>[] => {
    if (R.isNil(list)) {
        return null;
    }

    const bySubScenarios = R.toPairs(R.groupBy(makeSchemaId, list)) as [string, PredictionListWell[]][];
    const wellsInSubScenario = (schemaId: string) => (R.find(x => x[0] === schemaId, bySubScenarios) || ['0', []])[1];

    const oilWater = (x: PredictionListWell) => x.water + x.oil;
    const maxByOilWater = (a: PredictionListWell, b: PredictionListWell) => R.maxBy(oilWater, a, b);

    const emptyListWell: PredictionListWell = { oil: 0, water: 0 } as unknown as PredictionListWell;
    const maxBySubScenario = R.memoizeWith(
        (schemaId: string) => schemaId,
        (schemaId: string) => {
            return oilWater(
                R.reduce<PredictionListWell, PredictionListWell>(
                    maxByOilWater,
                    emptyListWell,
                    wellsInSubScenario(schemaId)
                )
            );
        }
    );

    // TODO: вынести как generic функцию в ramda.ts
    const sumBy = (schemaId: string, prop: (x: PredictionListWell) => number) =>
        R.reduce<PredictionListWell, number>(
            (acc: number, x: PredictionListWell) => acc + prop(x),
            0,
            wellsInSubScenario(schemaId)
        );

    const oilWaterSs = (x: [string, PredictionListWell[]]) => sumBy(x[0], R.prop('oil')) + sumBy(x[0], R.prop('water'));

    const maxByOilWaterSs = (a: [string, PredictionListWell[]], b: [string, PredictionListWell[]]) =>
        R.maxBy(oilWaterSs, a, b);

    const maxByAllSubScenarios = oilWaterSs(R.reduce(maxByOilWaterSs, ['0', []], bySubScenarios));
    const sumBySubScenario = R.memoizeWith(
        (schemaId: string) => schemaId,
        (schemaId: string) => ({
            oil: sumBy(schemaId, R.prop('oil')),
            water: sumBy(schemaId, R.prop('water'))
        })
    );

    const wells = () => makeWells((x: PredictionListWell) => makePredictionWell(x, maxBySubScenario), list);

    const subScenarios = R.map((x: [string, PredictionListWell[]]) => {
        const filtered = sortWellsByName(
            R.filter((w: Item<any>) => makeSchemaId(w.id.scenarioId, w.id.subScenarioId) === x[0], wells())
        );
        return makeSubScenario(x[1][0], sumBySubScenario(x[0]), maxByAllSubScenarios, filtered);
    }, bySubScenarios);

    const scenarios = R.map(
        (x: [string, PredictionListWell[]]) =>
            makePredictionScenario(
                x[1][0],
                R.filter(w => w.id.scenarioId === +x[0], subScenarios)
            ),
        R.toPairs(R.groupBy(x => x.scenarioId.toString(), list))
    );

    const objects = R.map(
        (x: [string, PredictionListWell[]]) =>
            makeObject(
                x[1][0],
                R.filter(w => w.id.prodObjId === +x[0], scenarios)
            ),
        R.toPairs(R.groupBy(x => x.productionObjectId.toString(), list))
    );

    return R.map(
        (x: [string, PredictionListWell[]]) =>
            makeOilfield(
                x[1][0],
                R.filter(w => w.id.oilFieldId === +x[0], objects)
            ),
        R.toPairs(R.groupBy(x => x.oilFieldId.toString(), list))
    );
};

export const rowsProxy = (list: ProxyListWell[]): Item<any>[] => {
    if (R.isNil(list)) {
        return null;
    }

    const wells = () => makeWells(makeProxyWell, list);

    const byScenario = R.toPairs(R.groupBy(x => x.scenarioId.toString(), list));
    const avgMape = (scenarioId: number) =>
        R.mean(
            R.filter(x => x > 0, R.pluck('oilError', (R.find(x => +x[0] === scenarioId, byScenario) || ['0', []])[1]))
        );

    const scenarios = R.any(x => R.not(R.isNil(x.scenarioId)), list)
        ? R.reject(
              (x: Item<any>) => R.isNil(x.id.scenarioId),
              R.map(
                  (x: [string, ProxyListWell[]]) =>
                      makeProxyScenario(
                          x[1][0],
                          avgMape(+x[0]),
                          sortWellsByName(R.filter(w => w.id.scenarioId === +x[0], wells()))
                      ),
                  byScenario
              )
          )
        : null;

    const objects = R.map(
        (x: [string, ProxyListWell[]]) =>
            makeObjectWithInsim(
                x[1][0],
                R.filter(w => w.id.prodObjId === +x[0], scenarios || wells())
            ),
        R.toPairs(R.groupBy(x => x.productionObjectId.toString(), list))
    );

    const q = R.map(
        (x: [string, ProxyListWell[]]) =>
            makeOilfield(
                x[1][0],
                R.filter(w => w.id.oilFieldId === +x[0], objects)
            ),
        R.toPairs(R.groupBy(x => x.oilFieldId.toString(), list))
    );
    return q;
};

export const rowsRecords = (list: WellModel[]): Item<WellRecord | null>[] => {
    if (R.isNil(list)) {
        return null;
    }

    const wells = () =>
        makeWells(
            makeWellWithRecord,
            R.reject((it: WellModel) => !!it.id && it.charWorkId === CharWorkEnum.Piezometric, list)
        );

    const scenarios = R.any(x => R.not(R.isNil(x.scenarioId)), list)
        ? R.map(
              (x: [string, WellModel[]]) =>
                  makeScenario(x[1][0], sortWellsByName(R.filter(w => w.id.scenarioId === +x[0], wells()))),
              R.toPairs(R.groupBy(x => x.scenarioId.toString(), list))
          )
        : null;

    const objects = R.map(
        (x: [string, WellModel[]]) =>
            makeObjectWithSumm(
                x[1][0],
                scenarios
                    ? R.filter(w => w.id.prodObjId === +x[0], scenarios)
                    : R.filter(w => w.id.prodObjId === +x[0], wells())
            ),
        R.toPairs(R.groupBy(x => x.productionObjectId.toString(), list))
    );

    return R.map(
        (x: [string, WellModel[]]) =>
            makeOilfield(
                x[1][0],
                R.filter(w => w.id.oilFieldId === +x[0], objects)
            ),
        R.toPairs(R.groupBy(x => x.oilFieldId.toString(), list))
    );
};

export const rowsUpload = (list: WellModel[]): Item<WellRecord | null>[] => {
    if (R.isNil(list)) {
        return null;
    }

    const wells = R.map(model => makeOilfield(model, null), list);
    return wells;
};

export const rowsObjects = (list: WellModel[]): Item<WellRecord | null>[] => {
    if (R.isNil(list)) {
        return null;
    }

    const objects = () => makeObjects(makeObject, list);

    return R.map(
        (x: [string, WellModel[]]) =>
            makeOilfield(
                x[1][0],
                R.filter(w => w.id.oilFieldId === +x[0], objects())
            ),
        R.toPairs(R.groupBy(x => x.oilFieldId.toString(), list))
    );
};

export const rowsScenarios = (list: WellModel[]): Item<WellRecord | null>[] => {
    if (R.isNil(list)) {
        return null;
    }

    const scenarios = R.map(
        (x: [string, WellModel[]]) =>
            makeScenario(
                x[1][0],
                R.filter(w => w.id.scenarioId === +x[0], [])
            ),
        R.toPairs(R.groupBy(x => x.scenarioId.toString(), list))
    );

    const objects = R.map(
        (x: [string, WellModel[]]) =>
            makeObject(
                x[1][0],
                R.filter(w => w.id.prodObjId === +x[0], scenarios)
            ),
        R.toPairs(R.groupBy(x => x.productionObjectId.toString(), list))
    );

    return R.map(
        (x: [string, WellModel[]]) =>
            makeOilfield(
                x[1][0],
                R.filter(w => w.id.oilFieldId === +x[0], objects)
            ),
        R.toPairs(R.groupBy(x => x.oilFieldId.toString(), list))
    );
};

const makeWell = (model: WellModel | ProxyListWell): Item<WithWellType> => {
    return {
        id: new WellBrief(
            model.oilFieldId,
            model.id,
            model.productionObjectId,
            model.charWorkId,
            model.scenarioId,
            (model as WellModel).subScenarioId
        ),
        name: model.name,
        type: RosterItemEnum.Well,
        subs: null,
        attributes: {
            type: model.charWorkId,
            favorite: model.favorite,
            horisontState: model.horisontState
        }
    };
};

const makeProxyWell = (model: ProxyListWell) =>
    R.mergeDeepRight(makeWell(model), { attributes: { isVirtual: model.isVirtual, mape: model.oilError } });

const makePredictionWell = (model: PredictionListWell, maxBySubScenario: (schemaId: string) => number) =>
    R.mergeDeepRight(makeWell(model), {
        attributes: {
            oilError: model.oilError,
            isVirtual: model.isVirtual,
            weights: {
                oil: {
                    value: model.oil,
                    percent: round1((model.oil / maxBySubScenario(makeSchemaId(model))) * 100)
                },
                water: {
                    value: model.water,
                    percent: round1((model.water / maxBySubScenario(makeSchemaId(model))) * 100)
                }
            }
        }
    });

const makeWellWithRecord = (model: WellModel): Item<WellRecord> =>
    R.mergeDeepRight(makeWell(model), {
        attributes: { marks: makeRecordMarks(model), horisontState: model.horisontState }
    }) as Item<WellRecord>;

const makeScenario = (model: WellModel | PredictionListWell, subs: Item<any>[]): Item<any> => ({
    id: new WellBrief(model.oilFieldId, null, model.productionObjectId, model.charWorkId, model.scenarioId),
    name: model.scenarioName,
    type: RosterItemEnum.Scenario,
    subs: subs || null,
    attributes: {
        favorite: model.favorite
    }
});

const makeProxyScenario = (model: ProxyListWell, avgMape: number, subs: Item<any>[]): Item<any> => ({
    id: new WellBrief(model.oilFieldId, null, model.productionObjectId, model.charWorkId, model.scenarioId),
    name: model.scenarioName,
    type: RosterItemEnum.Scenario,
    subs: subs || null,
    attributes: {
        mape: avgMape,
        favorite: model.favorite
    }
});

const makeSubScenario = (
    model: PredictionListWell,
    sums: { oil: number; water: number },
    max: number,
    subs: Item<any>[]
): Item<any> => ({
    id: new WellBrief(
        model.oilFieldId,
        null,
        model.productionObjectId,
        model.charWorkId,
        model.scenarioId,
        model.subScenarioId
    ),
    name: model.subScenarioName,
    type: RosterItemEnum.SubScenario,
    subs: subs || null,
    attributes: {
        marks: [MarkEnum.SummInsim],
        weights: {
            oil: {
                value: sums.oil,
                percent: round1((sums.oil / max) * 100)
            },
            water: {
                value: sums.water,
                percent: round1((sums.water / max) * 100)
            }
        }
    }
});

const makePredictionScenario = (model: WellModel | PredictionListWell, subs: Item<any>[]) => {
    let weights = null;
    let clickable = false;

    // у данного сценария есть только один "фейковый" подсценарий, который необходимо скрыть, а всю информацию
    // отобразить на уровне сценария
    // обработчик клика при этом должен быть обработчиком клика по "фейковому" подсценарию для отображения
    // соответствующих данных
    const hasOnlyFakeSubScenario =
        !!subs &&
        subs.length === 1 &&
        subs[0].id.eqTo(
            new WellBrief(model.oilFieldId, null, model.productionObjectId, model.charWorkId, model.scenarioId, 0)
        );
    if (hasOnlyFakeSubScenario) {
        clickable = true;
        weights = subs[0].attributes.weights;
        subs = sortWellsByName(subs[0].subs);
    }

    return R.mergeDeepRight<Item<any>, Partial<Item<any>>>(
        makeScenario(model, hasOnlyFakeSubScenario ? subs : R.sortBy(x => x.attributes.weights.oil.value, subs)),
        {
            attributes: {
                marks: clickable ? [MarkEnum.SummInsim] : null,
                clickable: clickable,
                weights: weights,
                favorite: model.favorite
            }
        }
    ) as Item<any>;
};

const makeObject = (model: WellModel | PredictionListWell | ProxyListWell, subs: Item<any>[] = null): Item<any> => ({
    id: new WellBrief(model.oilFieldId, null, model.productionObjectId, null, null),
    name: model.productionObjectName,
    type: RosterItemEnum.ProductionObject,
    subs: subs || null,
    attributes: null
});

const makeObjectWithInsim = (model: ProxyListWell, subs: Item<any>[]): Item<any> =>
    R.mergeDeepRight(makeObject(model, subs), { attributes: { marks: [MarkEnum.Insim] } });

const makeObjectWithSumm = (model: WellModel, subs: Item<any>[]): Item<any> =>
    R.mergeDeepRight(makeObject(model, subs), { attributes: { marks: [MarkEnum.Summ] } });

const makeOilfield = (model: WellModel | PredictionListWell | ProxyListWell, subs: Item<any>[]): Item<any> => ({
    id: new WellBrief(model.oilFieldId, null, null),
    name: model.oilFieldName,
    type: RosterItemEnum.Oilfield,
    subs: subs || null,
    attributes: null
});

const makeRecordMarks = (well: WellModel): MarkEnum[] => {
    // if (!well.id) {
    //     throw new Error('record marks can be applied only for a well');
    // }

    const stateMark =
        well.state === 2 ? MarkEnum.StateActive : well.state === 1 ? MarkEnum.StateStopped : MarkEnum.Empty;

    const variationsMark =
        well.variations === 2
            ? MarkEnum.VariationsNegative
            : well.variations === 1
            ? MarkEnum.VariationsPositive
            : MarkEnum.VariationsEmpty;

    return [stateMark, variationsMark];
};

const makeWells = (
    makeWell: (m: WellModel | PredictionListWell | ProxyListWell) => Item<any>,
    list: PredictionListWell[] | ProxyListWell[] | WellModel[]
) => R.pipe(R.map(makeWell), R.sortBy(R.path(['id', 'id'])))(list);

const makeObjects = (
    makeObject: (m: WellModel | PredictionListWell | ProxyListWell) => Item<any>,
    list: PredictionListWell[] | ProxyListWell[] | WellModel[]
) => R.uniq(R.pipe(R.map(makeObject), R.sortBy(R.path(['id', 'id'])))(list));

const makeSchemaIdFromValues = (scenarioId: number, subScenarioId: number) => `${scenarioId}-${subScenarioId}`;
const makeSchemaIdFromModel = (model: PredictionListWell) =>
    makeSchemaIdFromValues(model.scenarioId, model.subScenarioId);
const makeSchemaId = (modelOrScenarioId: PredictionListWell | number, subScenarioId?: number): string =>
    R.ifElse(
        R.is(Number),
        () => makeSchemaIdFromValues(modelOrScenarioId as number, +subScenarioId),
        () => makeSchemaIdFromModel(modelOrScenarioId as PredictionListWell)
    )(modelOrScenarioId);

const sortWellsByName = (list: Item<any>[]) => R.sortWith([byVirtualness, R.ascend(R.prop('name'))], list);

const byVirtualness = (first: Item<any>, second: Item<any>) => {
    if (first.attributes?.isVirtual && !second.attributes?.isVirtual) {
        return 1;
    }

    if (!first.attributes?.isVirtual && second.attributes?.isVirtual) {
        return -1;
    }

    return 0;
};
