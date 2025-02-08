import { WellTypeEnum } from '../../common/enums/wellTypeEnum';

/**
 * Определяет скважину, которая доступна для оптимизации в оптимизационном расчете
 */
export interface WellGroupItem {
    id: number;
    name: string;
    type: WellTypeEnum;
    license?: boolean;
    selected?: boolean;
}

/**
 * Серверная сущность, определяющая скважину для оптимизации
 */
export interface WellGroupItemRaw {
    id: number;
    name: string;
    type: number;
    license: boolean;
    selected: boolean;
}

/**
 * Конвертирует данные, пришедшие с сервера в бизнес объект
 * @param raw - данные о скважине, пришедшие с сервера
 */
export const fromRaw = (raw: WellGroupItemRaw): WellGroupItem => ({
    id: raw.id,
    name: raw.name,
    type: raw.type,
    license: raw.license,
    selected: raw.selected
});
