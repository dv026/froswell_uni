import React from 'react';
import { Fragment } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { Box, Button, ButtonGroup, Center } from '@chakra-ui/react';
import { equals, includes, map, takeWhile } from 'ramda';

import { DirectedStageEnum as OptimizationDirectedStageEnum } from '../../../optimization/enums/directedStageEnum';
import { DirectedStageEnum as PredictionDirectedStageEnum } from '../../../prediction/enums/directedStageEnum';
import { DirectedStageEnum as ProxyDirectedStageEnum } from '../../../proxy/enums/directedStageEnum';
import { isNullOrEmpty, mapIndexed } from '../../helpers/ramda';
import { CompleteIcon } from '../customIcon/general';

import css from './index.module.less';

type CommonDirectedStageEnum = OptimizationDirectedStageEnum | PredictionDirectedStageEnum | ProxyDirectedStageEnum;

export interface DirectedStagesProps {
    stages: CommonDirectedStageEnum[];
    current: CommonDirectedStageEnum;
    onClick: (stage: CommonDirectedStageEnum) => void;
    getLabel: (stage: CommonDirectedStageEnum) => string;
    getButtonIcon: (stage: CommonDirectedStageEnum) => React.ReactElement;
}

export const DirectedStages: React.FC<DirectedStagesProps> = (p: DirectedStagesProps) => {
    if (isNullOrEmpty(p.stages)) {
        return null;
    }

    const checkedStages = takeWhile(x => !equals(x, p.current), p.stages);

    const active = (s: CommonDirectedStageEnum) => s === p.current;
    const complete = (s: CommonDirectedStageEnum) =>
        includes(
            s,
            map(x => x, checkedStages)
        );
    const disabled = (s: CommonDirectedStageEnum) => !active(s) && !complete(s);

    return (
        <ButtonGroup spacing={0} variant='stage' className={css.directedStages} pb={'10px'}>
            {mapIndexed((item: CommonDirectedStageEnum, index: number) => {
                return (
                    <Fragment key={item}>
                        <Stage
                            key={item}
                            active={active(item)}
                            complete={complete(item)}
                            disabled={disabled(item)}
                            icon={p.getButtonIcon(item)}
                            label={p.getLabel(item)}
                            value={item}
                            onClick={p.onClick}
                        />
                        {index !== p.stages.length - 1 ? (
                            <Center>
                                <ChevronRightIcon color='icons.grey' boxSize={8} />
                            </Center>
                        ) : null}
                    </Fragment>
                );
            }, p.stages)}
        </ButtonGroup>
    );
};

interface StageProps {
    active?: boolean;
    complete?: boolean;
    disabled?: boolean;
    icon: React.ReactElement;
    key: number;
    label: string;
    value: CommonDirectedStageEnum;
    onClick: (stage: CommonDirectedStageEnum) => void;
}

const Stage: React.FC<StageProps> = (p: StageProps) => {
    const size = 7;

    return (
        <Button
            key={p.key}
            isActive={p.active}
            isDisabled={p.disabled}
            minWidth='140px'
            width='auto'
            onClick={() => p.onClick(p.value)}
        >
            <Box className={css.boxIcon}>
                {p.complete ? (
                    <CompleteIcon color='icons.green' boxSize={size} />
                ) : (
                    React.cloneElement(p.icon, { boxSize: size })
                )}
            </Box>
            {p.label}
        </Button>
    );
};
