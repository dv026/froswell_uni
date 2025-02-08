import React from 'react';

import { RGBA, rgba } from '../../../helpers/colors';
import { cls } from '../../../helpers/styles';
import { isStr } from '../../../helpers/typeGuards';

import css from './cell.module.less';

/**
 * Способы заливки значка легенды
 */
export enum ThumbFillEnum {
    /**
     * Одноцветная заливка
     */
    Filled,

    /**
     * Сплошная граница
     */
    HollowSolid,

    /**
     * Пунктирная граница
     */
    HollowDashed
}

/**
 * Вид значка легенды
 */
export enum ThumbShapeEnum {
    /**
     * Квадрат
     */
    Square,

    /**
     * Круг
     */
    Circle
}

interface Props {
    /**
     * Определяет основной цвет для ячейки легенды
     *      RGBA   - конкретный цвет
     *      string - внешний класс, определяющий цвет
     */
    color: RGBA | string;

    /**
     * Текст ячейки легенды
     */
    text: string;

    /**
     * Действия при клике на ячейку легенды
     */
    onClick: () => void;

    /**
     * Является ли ассоциированный с легендой элемент графика скрытым (по умолчанию - false)
     */
    hidden?: boolean;

    /**
     * Способ заливки значка легенды (по умолчанию - заливается полностью)
     */
    fill?: ThumbFillEnum;

    /**
     * Фигура для значка легенды (по умолчанию - квадрат)
     */
    shape?: ThumbShapeEnum;
    /**
     * Является ли легенда активной
     */
    active?: boolean;
}

type ThumbProps = Pick<Props, 'color' | 'fill' | 'hidden' | 'shape'>;

export const Cell: React.FC<React.PropsWithChildren<Props>> = (p: React.PropsWithChildren<Props>) => {
    return (
        <div
            className={cls(css.legend__cell, p.hidden && css.legend__cell_hidden, p.active && css.legend__cell_active)}
            onClick={p.onClick}
        >
            <div className={css.legend__cellTitle}>{p.text}</div>
            <Thumb {...p} />
            {p.children}
        </div>
    );
};

const Thumb = ({ color, hidden, fill = ThumbFillEnum.Filled, shape = ThumbShapeEnum.Square }: ThumbProps) => {
    return (
        <div
            className={cls(
                css.legend__cellThumb,
                isStr(color) && color,
                shapeCls(shape),
                fillCls(fill),
                hidden && css.legend__cellThumb_hidden
            )}
            style={styles(color, fill)}
        ></div>
    );
};

const styles = (color: RGBA | string, fill: ThumbFillEnum): React.CSSProperties => {
    const clr = isStr(color) ? color : rgba(color);
    return {
        backgroundColor: fill === ThumbFillEnum.Filled ? clr : undefined,
        borderColor: clr
    };
};

const shapeCls = (shape: ThumbShapeEnum) => (shape === ThumbShapeEnum.Circle ? css.legend__cellThumb_hidden : '');

const fillCls = (fill: ThumbFillEnum) =>
    fill === ThumbFillEnum.HollowDashed
        ? css.legend__cellThumb_dashed
        : fill === ThumbFillEnum.HollowSolid
        ? css.legend__cellThumb_solid
        : '';
