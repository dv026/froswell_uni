import React from 'react';

import { WellError } from '../../../../calculation/entities/computation/calculationDetails';
import { ErrorsGrid } from './errorsGrid';

import css from './calculation.module.less';

interface Props {
    orderNumber: number;
    rows: WellError[];
    isFinished: boolean;
}

export const ErrorsTab: React.FC<Props> = (p: Props) =>
    // не отображать грид в том случае, если нет скважин или orderNumber еще не рассчитан (не закончилась первая
    // адаптация и не выставился порядок улучшения скважин)
    p.rows &&
    p.orderNumber > 0 && (
        <div className={css.calculation}>
            <div className={css.calculation__errorsGridContainer}>
                <ErrorsGrid orderNumber={p.orderNumber} rows={p.rows} isFinished={p.isFinished} />
            </div>
        </div>
    );
