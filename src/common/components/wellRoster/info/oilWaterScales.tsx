import React from 'react';

import { cls } from '../../../helpers/styles';
import { ControlWithClassProps } from '../../customControl';
import { Scales, Weight, WeightData } from './scales';

import css from './scales.module.less';

export interface OilWaterScalesProps extends ControlWithClassProps {
    weights: {
        oil: WeightData;
        water: WeightData;
    };
}

export const OilWaterScales: React.FC<OilWaterScalesProps> = (p: OilWaterScalesProps) => (
    <div className={cls(p.className)}>
        <Scales>
            <Weight className={css.scales__weight_oil} data={p.weights.oil} />
            <Weight className={css.scales__weight_water} data={p.weights.water} />
        </Scales>
    </div>
);
