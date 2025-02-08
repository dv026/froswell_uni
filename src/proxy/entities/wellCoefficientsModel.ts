import { map, pipe } from 'ramda';

import { p10, p50, p90 } from '../../common/helpers/math';
import { isNullOrEmpty } from '../../common/helpers/ramda';

export interface WellProxy {
    id: number;
    name: string;
}

export interface HasTransmissibility {
    conductivity: Array<number>;
    sumDiffPress: number;

    flow(idx: number): number;
    getFlowP(quantile: (x: number[]) => number): number;
    getFlowP10(): number;
    getFlowP50(): number;
    getFlowP90(): number;
}

const getP50 = (fn: (any) => number) => pipe(map(fn), p50);

export class NeighborCoefficientsModel implements WellProxy, HasTransmissibility {
    /**
     * Идентификатор соседа (ид кважины + ид пласта)
     */
    public id: number;

    /**
     * Идентификатор скважины
     */
    public wellId: number;

    /**
     * Идентификатор пласта
     */
    public plastId: number;

    /**
     * Название скважины
     */
    public name: string;

    /**
     * Проводимость
     */
    public conductivity: Array<number>;

    /**
     * Известная проводимость по существующей модели. (Может быть null)
     */
    public transmissibility: number;

    /**
     * Депрессия
     */
    public sumDiffPress: number;

    public volume: number;

    /**
     * Обводненность
     */
    public watercut: number;

    /**
     * Если true, то объект добавлен вручную, не основан на реальных данных
     */
    public isMissing: boolean;

    /**
     * Поток
     * @param idx индекс реализации (если индекс меньше 0, то считается по всем реализациям)
     */
    public flow(idx = -1): number {
        const getFlow = (conductivity: number): number => conductivity * this.sumDiffPress;

        return idx < 0 ? getP50(getFlow)(this.conductivity) : getFlow(this.conductivity[idx]);
    }

    public getFlowP10(): number {
        return this.getFlowP(p10);
    }

    public getFlowP50(): number {
        return this.getFlowP(p50);
    }

    public getFlowP90(): number {
        return this.getFlowP(p90);
    }

    public getFlowP(quantile: (x: number[]) => number): number {
        return quantile(this.conductivity) * this.sumDiffPress;
    }

    public nameOrId(wrap: boolean = true): string {
        return isNullOrEmpty(this.name) ? (wrap ? `[${this.id}]` : this.id.toString()) : this.name;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public static fromRaw(raw: any): NeighborCoefficientsModel {
        let model = new NeighborCoefficientsModel();

        model.id = raw.id;
        model.name = '';
        model.sumDiffPress = raw.sumDiffPress;
        model.conductivity = raw.conductivity;
        model.plastId = raw.plastId;
        model.transmissibility = raw.transmissibility;
        model.wellId = raw.wellId;
        model.isMissing = raw.isMissing;
        model.volume = raw.volume;
        model.watercut = raw.watercut;

        return model;
    }
}
