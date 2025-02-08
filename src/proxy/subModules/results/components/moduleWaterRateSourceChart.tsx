import { WaterRateSourceChart } from 'calculation/components/results/waterRateSourceChart';
import { useRecoilValue } from 'recoil';

import { allPlasts } from '../../../../calculation/store/plasts';
import { waterRateSource } from '../store/waterRateSource';

export const ModuleWaterRateSourceChart = () => {
    const data = useRecoilValue(waterRateSource);
    const plasts = useRecoilValue(allPlasts);

    return <WaterRateSourceChart data={data} plasts={plasts} dataKey='waterRate' />;
};
