import { useRecoilCallback } from 'recoil';

import { ProcessingStatusEnum } from '../../common/entities/processingStatusEnum';
import { shallow } from '../../common/helpers/ramda';
import { KrigingCalcSettingsModel } from '../../input/entities/krigingCalcSettings';
import { abortKrigingPost, checkBatchStatusGet, startKrigingBatchPost } from '../../input/gateways';
import { batchStatusState } from './batchStatus';

export function useKrigingMutations() {
    const check = useRecoilCallback(({ set }) => async (jobId: number) => {
        const response = await checkBatchStatusGet(jobId);

        set(batchStatusState, response.data);
    });

    const clear = useRecoilCallback(({ snapshot, set }) => async (setAborted: boolean) => {
        const batchStatus = await snapshot.getPromise(batchStatusState);

        set(batchStatusState, setAborted ? shallow(batchStatus, { statusId: ProcessingStatusEnum.Aborted }) : null);
    });

    const calculate = useRecoilCallback(({ set }) => async (model: KrigingCalcSettingsModel) => {
        const response = await startKrigingBatchPost(model);

        set(batchStatusState, response.data);
    });

    const abort = useRecoilCallback(() => async (jobId: number) => {
        await abortKrigingPost(jobId);
    });

    return {
        check,
        clear,
        calculate,
        abort
    };
}
