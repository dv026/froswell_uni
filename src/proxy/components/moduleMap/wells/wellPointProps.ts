import { HorizontalWellProps, WellProps } from '../../../../common/components/mapCanvas/wellProps';
import { WellTypeEnum } from '../../../../common/enums/wellTypeEnum';
import { DateLabelModel } from '../../../entities/proxyMap/dateLabelModel';

export interface WellPointProps extends WellProps, HorizontalWellProps {
    type?: WellTypeEnum;
    isImaginary?: boolean;
    dateLabelModel?: DateLabelModel;
}
