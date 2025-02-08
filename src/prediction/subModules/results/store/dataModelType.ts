import { atom } from 'recoil';

import { DataModelType } from '../../../../calculation/enums/dataModelType';

export const dataModelTypeState = atom<DataModelType>({
    key: 'predictionResults__dataModelTypeState',
    default: DataModelType.Oil
});
