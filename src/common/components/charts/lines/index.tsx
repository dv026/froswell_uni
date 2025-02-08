import React, { ReactNode } from 'react';

import { Line } from 'recharts';

import { cls, StrOrArr } from '../../../helpers/styles';
import { AxisYCommon } from '../axes';
import { ActiveDot, DotPropsOnLine, getDot, HollowDot } from '../dots';
import { RepairsDot } from '../dots/repairsDot';

import cssDot from '../dots/index.module.less';
import css from './index.module.less';

/**
 * Возвращает компонент для отображения параметра "нефть"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 * @param dashed - True - линия отображается пунктирной, False - сплошной
 */
export const lineOil = (
    yAxis: AxisYCommon,
    dataKey: string = 'oil',
    dashed: boolean = false,
    withDot: boolean = false
): ReactNode => baseOilLine(yAxis, dataKey, dataKey, false, withDot, dashed ? 'dashed' : undefined);

/**
 * Возвращает компонент для отображения параметра "нефть" с точками, на которых отображаются проведенные ремонты
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 * @param dashed - True - линия отображается пунктирной, False - сплошной
 */
export const lineOilWithRepairs = (
    yAxis: AxisYCommon,
    dataKey: string = 'oil',
    name: string = 'oil',
    dashed: boolean = false,
    withDot: boolean = false
): ReactNode => baseOilLine(yAxis, dataKey, name, true, withDot, dashed ? 'dashed' : undefined);

/**
 * Возвращает компонент для отображения параметра "закачка"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 * @param dashed - True - линия отображается пунктирной, False - сплошной
 */
export const lineInjection = (yAxis: AxisYCommon, dataKey: string = 'injection', dashed: boolean = false): ReactNode =>
    baseInjectionLine(yAxis, dataKey, dataKey, false, dashed ? 'dashed' : undefined);

/**
 * Возвращает компонент для отображения параметра "закачка" с точками, на которых отображаются проведенные ремонты
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 * @param dashed - True - линия отображается пунктирной, False - сплошной
 */
export const lineInjectionWithRepairs = (
    yAxis: AxisYCommon,
    dataKey: string = 'injection',
    name: string = 'injection',
    dashed: boolean = false
): ReactNode => baseInjectionLine(yAxis, dataKey, name, true, dashed ? 'dashed' : undefined);

/**
 * Возвращает компонент для отображения параметра "закачка"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 */
export const lineInjectionDotted = (yAxis: AxisYCommon, dataKey: string = 'injection'): ReactNode =>
    line(
        dataKey,
        dataKey,
        [css.line_injection],
        yAxis,
        {
            static: <HollowDot dataKey={dataKey} className={[cssDot.dot, cssDot.dot_injection]} />,
            active: <ActiveDot dataKey={dataKey} className={[cssDot.dot, cssDot.dot_injection]} />
        },
        {
            lineType: 'dotted'
        }
    );

/**
 * Возвращает компонент для отображения параметра "газ"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 * @param dashed - True - линия отображается пунктирной, False - сплошной
 */
export const lineGas = (yAxis: AxisYCommon, dataKey: string = 'gas', dashed: boolean = false): ReactNode =>
    line(dataKey, dataKey, [css.line_gas], yAxis, [cssDot.dot, cssDot.dot_gas], {
        lineType: dashed ? 'dashed' : undefined
    });

/**
 * Возвращает компонент для отображения параметра "жидкость"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 * @param dashed - True - линия отображается пунктирной, False - сплошной
 */
export const lineLiquid = (yAxis: AxisYCommon, dataKey: string = 'liquid', dashed: boolean = false): ReactNode =>
    line(dataKey, dataKey, [css.line_liquid], yAxis, [cssDot.dot, cssDot.dot_liquid], {
        lineType: dashed ? 'dashed' : undefined
    });

/**
 * Возвращает компонент для отображения параметра "жидкость"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 */
export const lineLiquidDotted = (yAxis: AxisYCommon, dataKey: string = 'liquid'): ReactNode =>
    line(
        dataKey,
        dataKey,
        [css.line_liquid],
        yAxis,
        {
            static: <HollowDot dataKey={dataKey} className={[cssDot.dot, cssDot.dot_liquid]} />,
            active: <ActiveDot dataKey={dataKey} className={[cssDot.dot, cssDot.dot_liquid]} />
        },
        {
            lineType: 'dotted'
        }
    );

/**
 * Возвращает компонент для отображения параметра "обводненность"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 * @param dashed - True - линия отображается пунктирной, False - сплошной
 */
export const lineWatercut = (yAxis: AxisYCommon, dataKey: string = 'watercut', dashed: boolean = false): ReactNode =>
    line(dataKey, dataKey, [css.line_watercut], yAxis, [cssDot.dot, cssDot.dot_watercut], {
        lineType: dashed ? 'dashed' : undefined
    });

/**
 * Возвращает компонент для отображения параметра "обводненность"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 */
export const lineWatercutDotted = (yAxis: AxisYCommon, dataKey: string = 'watercut'): ReactNode =>
    line(
        dataKey,
        dataKey,
        [css.line_watercut],
        yAxis,
        {
            static: <HollowDot dataKey={dataKey} className={[cssDot.dot, cssDot.dot_watercut]} />,
            active: <ActiveDot dataKey={dataKey} className={[cssDot.dot, cssDot.dot_watercut]} />
        },
        {
            lineType: 'dotted'
        }
    );

/**
 * Возвращает компонент для отображения параметра "динамический уровень"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 * @param dashed - True - линия отображается пунктирной, False - сплошной
 */
export const lineDynamicLevel = (
    yAxis: AxisYCommon,
    dataKey: string = 'dynLevel',
    dashed: boolean = false
): ReactNode =>
    line(dataKey, dataKey, [css.line_dynLevel], yAxis, [cssDot.dot, cssDot.dot_dynLevel], {
        lineType: dashed ? 'dashed' : undefined
    });

/**
 * Возвращает компонент для отображения параметра "забойное давление"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 * @param dashed - True - линия отображается пунктирной, False - сплошной
 */
export const lineBottomHolePressure = (
    yAxis: AxisYCommon,
    dataKey: string = 'bottomHolePressure',
    dashed: boolean = false
): ReactNode =>
    line(dataKey, dataKey, [css.line_bottomHolePressure], yAxis, [cssDot.dot, cssDot.dot_pressure], {
        lineType: dashed ? 'dashed' : undefined
    });

/**
 * Возвращает компонент для отображения параметра "забойное давление"
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 */
export const lineBottomHolePressureDotted = (yAxis: AxisYCommon, dataKey: string = 'bottomHolePressure'): ReactNode =>
    line(
        dataKey,
        dataKey,
        [css.line_bottomHolePressure],
        yAxis,
        {
            static: <HollowDot dataKey={dataKey} className={[cssDot.dot, cssDot.dot_pressure]} />,
            active: <ActiveDot dataKey={dataKey} className={[cssDot.dot, cssDot.dot_pressure]} />
        },
        {
            lineType: 'dotted'
        }
    );

export const linePlastPressure = (yAxis: AxisYCommon, dataKey: string = 'plastPressure'): ReactNode =>
    line(
        dataKey,
        dataKey,
        [css.line_plastPressure],
        yAxis,
        {
            static: <HollowDot dataKey={dataKey} className={[cssDot.dot, cssDot.dot_pressure]} />,
            active: <ActiveDot dataKey={dataKey} className={[cssDot.dot, cssDot.dot_pressure]} />
        },
        {
            lineType: 'dotted'
        }
    );

type OptionalProps = {
    /**
     * Тип отображения линии.
     *      dashed - пунктирная линия
     *      dotted - линия, состоящая только из точек значений (сама линия не отображается)
     * Если не указано никакое значение, то отображается сплошная линия
     */
    lineType?: 'dashed' | 'dotted';
};

/**
 * Возвращает базовый компонент, на основе которого должны строиться все линии графиков
 * @param dataKey - название проперти объекта данных, из значения которого берутся данные данные для отображения линии
 * @param classes - классы-модификаторы для отображения линии
 * @param yAxis - ось Y, к которой привязаны значения линии
 * @param dot
 * @param optional - опциональные свойства
 */
const line = (
    dataKey: string,
    name: string,
    classes: StrOrArr,
    yAxis: AxisYCommon,
    dot?: DotPropsOnLine,
    optional?: OptionalProps
): ReactNode => (
    <Line
        className={cls(
            css.line,
            classes,
            optional?.lineType === 'dashed' && css.line_dashed,
            optional?.lineType === 'dotted' && css.line_dotted
        )}
        key={dataKey}
        dataKey={dataKey}
        name={name}
        type='monotone'
        yAxisId={yAxis}
        isAnimationActive={false}
        dot={getDot(dot, dataKey, true)}
        activeDot={getDot(dot, dataKey, false)}
    />
);

/**
 * Базовый компонент линии, отображающей параметр "нефть"
 * @param yAxis - ид оси Y, к которой привязана линия
 * @param dataKey - свойство объекта данных, который содержит значения для линии. По умолчанию 'oil'
 * @param withRepairs - необходимо ли отображать ремонты на точках линии
 * @param lineType - вид линии
 */
const baseOilLine = (
    yAxis: AxisYCommon,
    dataKey: string = 'oil',
    name: string,
    withRepairs: boolean = false,
    withDot: boolean = false,
    lineType: OptionalProps['lineType']
): ReactNode =>
    line(
        dataKey,
        name,
        [css.line_oil],
        yAxis,
        withRepairs
            ? {
                  static: <RepairsDot dotCls={cssDot.dot_oil} isActive={false} dataKey={dataKey} />,
                  active: <RepairsDot dotCls={cssDot.dot_oil} isActive={true} dataKey={dataKey} />
              }
            : withDot
            ? [cssDot.dot, cssDot.dot_oil]
            : null,
        { lineType }
    );

/**
 * Базовый компонент линии, отображающей параметр "закачка"
 * @param yAxis - ид оси Y, к которой привязана линия
 * @param dataKey - свойство объекта данных, который содержит значения для линии. По умолчанию 'injection'
 * @param withRepairs - необходимо ли отображать ремонты на точках линии
 * @param lineType - вид линии
 */
const baseInjectionLine = (
    yAxis: AxisYCommon,
    dataKey: string = 'injection',
    name: string = 'injection',
    withRepairs: boolean = false,
    lineType: OptionalProps['lineType']
): ReactNode =>
    line(
        dataKey,
        name,
        [css.line_injection],
        yAxis,
        withRepairs
            ? {
                  static: (
                      <RepairsDot dotCls={cssDot.dot_injection} isActive={false} dataKey={dataKey} isInjection={true} />
                  ),
                  active: (
                      <RepairsDot dotCls={cssDot.dot_injection} isActive={true} dataKey={dataKey} isInjection={true} />
                  )
              }
            : [cssDot.dot, cssDot.dot_injection],
        { lineType }
    );
