import { WellProps as BaseWellProps } from '../../common/components/mapCanvas/wellProps';

export interface WellProps extends BaseWellProps {
    p2?: number;
    p3?: number;
    p4?: number;
    oilRadius?: number;
    injRadius?: number;
    perfPercentage?: number;
}
