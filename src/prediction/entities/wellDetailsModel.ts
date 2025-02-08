// TODO: типизация
import { PlastModel } from 'common/entities/plastModel';
import * as R from 'ramda';

import { ScenarioModel } from '../../calculation/entities/scenarioModel';
import { WellBrief } from '../../common/entities/wellBrief';
import { isNullOrEmpty } from '../../common/helpers/ramda';
import { BestAdaptationEnum } from '../../proxy/subModules/calculation/enums/bestAdaptationEnum';
import { AdaptationBriefModel } from './adaptationBriefModel';

export class WellDetailsModel {
    /**
     * Ид скважины
     */
    public readonly id: number;

    /**
     * Ид объекта разработки скважины
     */
    public readonly productionObjectId: number;

    public readonly oilFieldId: number;
    public readonly charWorkId: number;

    /**
     * Текущий выбранный пласт для отображения данных
     */
    //public plastId: number;

    /**
     * Текущий выбранный режим адаптации
     */
    public adaptationType: BestAdaptationEnum;

    /**
     * Список сценариев, по которым есть расчеты
     */
    public scenarios: ScenarioModel[];

    /**
     * Список пластов, по которым есть данные для скважины
     */
    //public plasts: PlastModel[];

    /**
     * Список лучших адаптаций, по которым есть данные для скважины
     */
    public adaptations: AdaptationBriefModel[];

    /**
     * Набор из данных по пластам
     */
    public data: PlastPropsDynamic[];

    /**
     * Ид текущего сценария
     */
    //public scenarioId: number;

    /**
     * Ид текущего подсценария
     */
    //public subScenarioId: number;

    public constructor(
        well: WellBrief,
        scenarios: ScenarioModel[],
        defaultAdaptationType: BestAdaptationEnum,
        adaptations: AdaptationBriefModel[] = null
    ) {
        this.adaptations = adaptations || [];
        this.id = well.id;
        this.productionObjectId = well.prodObjId;
        this.oilFieldId = well.oilFieldId;
        this.charWorkId = well.charWorkId;
        //this.scenarioId = null;
        this.scenarios = scenarios;

        this.adaptationType = R.ifElse(
            R.any((x: AdaptationBriefModel) => x.type === defaultAdaptationType),
            R.always(defaultAdaptationType),
            x => selectByType(x, defaultAdaptationType)
        )(adaptations || []);

        //this.plastId = PlastModel.byObject().id;
    }

    public hasPropsForPlast(plastId: number): boolean {
        return R.any(x => x.plastId === plastId, this.data);
    }

    public toWellBrief = (): WellBrief =>
        new WellBrief(
            this.oilFieldId,
            this.id,
            this.productionObjectId,
            this.charWorkId
            //this.scenarioId,
            //this.subScenarioId
        );
}

export class PlastPropsDynamic {
    public plastId: number;
    public properties: Array<PlastDateProps>;

    /* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
    public static fromRaw(raw: any): PlastPropsDynamic {
        if (R.isNil(raw)) {
            return null;
        }

        let p = new PlastPropsDynamic();

        p.plastId = (R.head(raw) as any).plastId || PlastModel.byObject().id;
        p.properties = R.map(PlastDateProps.fromRaw, raw);

        return p;
    }
    /* eslint-enable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
}

export class PlastDateProps {
    public date: Date;

    public calc: PlastProps;

    public real: PlastProps;

    public stock: number;

    public repairName: number;

    public repairNameInjection: number;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public static fromRaw(raw: any): PlastDateProps {
        let p = new PlastDateProps();

        p.date = new Date(raw.date);
        p.calc = PlastProps.fromRaw(raw.calc);
        p.real = R.isNil(raw.real) ? null : PlastProps.fromRaw(raw.real);
        p.stock = raw.wellsInWork;
        p.repairName = raw.repairName;
        p.repairNameInjection = raw.repairNameInjection;

        return p;
    }
}

export class PlastProps {
    public liqRate: number;

    public oilRate: number;

    public injection: number;

    public watercut: number;

    public pressure: number;

    public skinFactor: number;

    public bottomHolePressure: number;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw): PlastProps {
        let p = new PlastProps();

        p.liqRate = raw.liqRate;
        p.oilRate = raw.oilRate;
        p.watercut = raw.watercut;
        p.injection = raw.injection;
        p.pressure = raw.pressure;
        p.skinFactor = raw.skinFactor;
        p.bottomHolePressure = raw.bottomHolePressure;

        return p;
    }
}

const selectByType = (list: AdaptationBriefModel[], defaultAdaptationType: BestAdaptationEnum): BestAdaptationEnum =>
    isNullOrEmpty(list)
        ? defaultAdaptationType
        : R.pipe(
              R.sortBy((x: AdaptationBriefModel) => x.type),
              x => x[0],
              x => x.type
          )(list);
