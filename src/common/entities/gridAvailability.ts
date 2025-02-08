import { filter, map, pipe } from 'ramda';

import { GridMapEnum } from '../enums/gridMapEnum';

/**
 * Определяет доступность (наличие данных) сетки скважин для её выбора на карте
 */
export interface GridAvailability {
    /**
     * Ид сетки
     */
    id: number;

    /**
     * Доступность на карте
     */
    available: boolean;
}

/**
 * Возвращает массив из доступных для карты сеток. Если таковых нет, возвращается пустой массив.
 */
// todo mb deprecated?
export function toArray<T extends GridMapEnum>(available: GridAvailability[]): T[] {
    return pipe(
        grids => filter((x: GridAvailability) => !!x.available, grids),
        map((x: GridAvailability) => x.id.toString() as T)
    )(available || []);
}
