export interface PlastModelBrief {
    /**
     * Ид пласта
     */
    id: number;

    /**
     * Есть ли сохраненные результаты по относительным фазовым проницаемостям для данного пласта
     */
    hasSavedResults: boolean;

    /**
     * Название пласта
     */
    name: string;

    /**
     * Названия тестов, проведенных для определения параметров относительных фазовых проницаемостей
     */
    tests: Array<string>;
}

export interface PlastModel {
    id: number;

    name: string;

    volume: number;

    waterSaturation: {
        initial: number;
        jumpPoint: number;
        limit: number;
    };

    formulas: {
        above: {
            c1: number;
            c2: number;
            c3: number;
        };
        below: {
            c1: number;
            c2: number;
        };
    };
}
