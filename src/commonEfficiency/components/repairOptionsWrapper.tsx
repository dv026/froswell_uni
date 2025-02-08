import React from 'react';
import { FC } from 'react';

import { KeyValue } from 'common/entities/keyValue';

import { RepairOptions } from './repairOptions';

interface RepairOptionsWrapper {
    repairs: KeyValue[];
    repairMode: number;
    onChangeRepair: (value: number) => void;
}

export const RepairOptionsWrapper: FC<RepairOptionsWrapper> = (props: RepairOptionsWrapper) => {
    const { repairs, repairMode, onChangeRepair } = props;

    return <RepairOptions dict={repairs} selected={repairMode} onChange={onChangeRepair} />;
};
