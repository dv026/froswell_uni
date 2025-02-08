import { addMonth, firstDay, firstDayOfYear } from '../../helpers/date';

export interface KrigingVariationLossesState {
    visible: boolean;
    startDate: Date;
    endDate: Date;
}

export const initialKrigingVariationLossesState: KrigingVariationLossesState = {
    visible: false,
    startDate: firstDayOfYear(new Date()),
    endDate: addMonth(firstDay(new Date()), -1)
};
