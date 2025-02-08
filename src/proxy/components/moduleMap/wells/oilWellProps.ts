import { HorizontalWellProps, WellProps } from '../../../../common/components/mapCanvas/wellProps';
import { DateLabelModel } from '../../../entities/proxyMap/dateLabelModel';

export interface OilWellProps extends WellProps, HorizontalWellProps {
    isImaginary: boolean;
    dateLabelModel: DateLabelModel;
}
