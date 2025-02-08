import { EvaluationTypeEnum } from 'commonEfficiency/enums/evaluationTypeEnum';
import { atom } from 'recoil';

export const evaluationTypeState = atom<EvaluationTypeEnum>({
    key: 'efficiencyResults__evaluationTypeState',
    default: EvaluationTypeEnum.Insim
});
