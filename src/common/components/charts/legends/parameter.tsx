import React, { FC } from 'react';

import { ChartParamEnum } from '../../../enums/chartParamEnum';
import { cls } from '../../../helpers/styles';

import css from './index.module.less';

export interface ParameterProps {
    /**
     * Название параметра, которое будет отображено в легенде
     */
    title: string;

    /**
     * Тип отображаемого параметра
     */
    type?: ChartParamEnum;

    /**
     * Цвет параметра, в случае если не указан тип отображаемого параметра
     */
    color?: string;

    /**
     * True - иконка параметра в виде пунктирной линии. False - в виде сплошной линии
     */
    dashed?: boolean;

    /**
     * True - параметр в виде точки
     */
    isDot?: boolean;

    /**
     * Отображается ли линия параметра на графике в текущий момент
     */
    visible: boolean;

    /**
     * Обработчик клика по параметру (для скрытия/отображения линии на графике)
     */
    onClick: () => void;
}

/**
 * Компонент, отображающий параметр скважины для легенды
 */
export const Parameter: FC<ParameterProps> = ({ title, type, color, visible, dashed, onClick }) => (
    <div className={css.legend__cell}>
        <div className={cls(css.parameter, !visible && css.parameter_hidden)} onClick={onClick}>
            <div className={css.parameter__title}>{title}</div>
            <div className={css.parameter__icon}>
                <Icon type={type} color={color} dashed={dashed} />
            </div>
        </div>
    </div>
);

/**
 * Компонент, отображающий параметр скважины для легенды
 */
export const DoubleParameter: FC<ParameterProps> = ({ title, type, visible, isDot, dashed, onClick }) => (
    <div className={css.legend__cell}>
        <div className={cls(css.parameter, !visible && css.parameter_hidden)} onClick={onClick}>
            <div className={css.parameter__title}>{title}</div>
            <div className={css.parameter__icon}>
                <Icon type={type} isDot={isDot} dashed={dashed} />
            </div>
            <div className={css.parameter__icon}>
                <Icon type={type} dashed={dashed} />
            </div>
        </div>
    </div>
);

/**
 * Компонент, отображающий параметр скважины для легенды
 */
export const TripleParameter: FC<ParameterProps> = ({ title, type, visible, isDot, onClick }) => (
    <div className={css.legend__cell}>
        <div className={cls(css.parameter, !visible && css.parameter_hidden)} onClick={onClick}>
            <div className={css.parameter__title}>{title}</div>
            <div className={css.parameter__icon}>
                <Icon type={type} isDot={isDot} />
            </div>
            <div className={css.parameter__icon}>
                <Icon type={type} dashed={true} />
            </div>
            <div className={css.parameter__icon}>
                <Icon type={type} dashed={false} />
            </div>
        </div>
    </div>
);

interface OptionalParameterProps extends ParameterProps {
    color?: string;
}

export const OptionalParameter: FC<OptionalParameterProps> = ({ title, type, visible, dashed, color, onClick }) => {
    return (
        <div className={css.legend__cell}>
            <div className={cls(css.parameter, !visible && css.parameter_hidden)} onClick={onClick}>
                <div className={css.parameter__title}>{title}</div>
                <div className={css.parameter__icon}>
                    <Icon type={type} dashed={dashed} color={color} />
                </div>
            </div>
        </div>
    );
};

interface IconProps extends Pick<ParameterProps, 'type' | 'isDot' | 'dashed'> {
    color?: string;
}

/**
 * Компонент, отображающий иконку параметра
 * @param type - тип параметра
 * @param dashed - True - иконка параметра в виде пунктирной линии. False - в виде сплошной линии
 */
const Icon: FC<IconProps> = ({ type, isDot, dashed, color }) => {
    let styles = {};

    if (color) {
        styles = { background: color || 'none' };
    }

    return (
        <div
            className={cls(css.icon, getIconType(type), isDot ? css.icon_isDot : dashed && css.icon_dashed)}
            style={styles}
        />
    );
};

/**
 * Возвращает класс-модификатор для отображения иконки определенного параметра
 * @param type - тип параметра
 */
const getIconType = (type: ChartParamEnum): string => {
    switch (type) {
        case ChartParamEnum.Liquid:
            return css.icon_liquid;
        case ChartParamEnum.Gas:
            return css.icon_gas;
        case ChartParamEnum.Oil:
            return css.icon_oil;
        case ChartParamEnum.InjectionRate:
            return css.icon_injection;
        case ChartParamEnum.Watercut:
            return css.icon_watercut;
        case ChartParamEnum.Pressure:
            return css.icon_pressure;
        case ChartParamEnum.PlastPressure:
            return css.icon_plastPressure;
        case ChartParamEnum.BottomHolePressure:
            return css.icon_pressure;
        case ChartParamEnum.DynamicLevel:
            return css.icon_dynLevel;
        case ChartParamEnum.Stock:
            return css.icon_stock;
        case ChartParamEnum.BuckleyLeverettFunction:
            return css.icon_buckleyLeverettFunction;
        case ChartParamEnum.BuckleyLeverettDerivativeFunction:
            return css.icon_buckleyLeverettDerivativeFunction;
        default:
            return null;
    }
};
