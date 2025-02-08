import { GridMapEnum } from '../../enums/gridMapEnum';
import { addMonth, firstDay, firstDayOfYear } from '../../helpers/date';

export interface KrigingVariationState {
    parameter: GridMapEnum;
    startDate: Date;
    endDate: Date;
}

export const initialKrigingVariationState: KrigingVariationState = {
    parameter: GridMapEnum.LiqRateVariation,
    startDate: firstDayOfYear(new Date()),
    endDate: addMonth(firstDay(new Date()), -1)
};
