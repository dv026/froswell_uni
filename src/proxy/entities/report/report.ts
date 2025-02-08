import { BestAdaptationEnum } from '../../subModules/calculation/enums/bestAdaptationEnum';
import { ResultDataTypeEnum } from '../../subModules/calculation/enums/resultDataTypeEnum';
import { PlastInfo } from './plastInfo';

export interface Report {
    adaptationCount: number;
    bestBy: BestAdaptationEnum;
    dataType: ResultDataTypeEnum;

    schemaId: [number, number];

    plastId: number;
    plasts: PlastInfo[];
}

export const create = (schemaId: [number, number]): Report => ({
    schemaId,
    adaptationCount: 20,
    bestBy: BestAdaptationEnum.ByOil,
    dataType: ResultDataTypeEnum.Adaptation,
    plastId: 0,
    plasts: null
});
