import React from 'react';

import { Button, ButtonGroup, Checkbox } from '@chakra-ui/react';
import { assoc, map, when } from 'ramda';
import { useRecoilState } from 'recoil';

import { WellGroupItem } from '../../../../../calculation/entities/wellGroupItem';
import { isNullOrEmpty } from '../../../../../common/helpers/ramda';
import { isNumber, Nullable } from '../../../../../common/helpers/types';
import { optimizationWellsState } from '../../../wellGroup/store/optimizationWells';

import css from './index.module.less';

export const OptimizationWells: React.FC = () => {
    const [wells, setWells] = useRecoilState(optimizationWellsState);

    const clickHandler = (id: Nullable<number>, add: boolean) => {
        if (isNullOrEmpty(wells)) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isChangingWell = isNumber(id) ? (w: WellGroupItem) => w.id === id : (w: WellGroupItem) => true;

        setWells(map(when(isChangingWell, assoc('selected', add)), wells));
    };

    return (
        <div className={css.optimizationWells}>
            <div className={css.optimizationWells__actions}>
                <ButtonGroup spacing={2} variant='link'>
                    <Button onClick={() => clickHandler(null, true)}>Выбрать все</Button>
                    <Button onClick={() => clickHandler(null, false)}>Отменить все</Button>
                </ButtonGroup>
            </div>
            <div className={css.optimizationWells__list}>
                {map(
                    x => (
                        <Well key={x.id} {...x} onClick={clickHandler} />
                    ),
                    wells
                )}
            </div>
        </div>
    );
};

type WellProps = WellGroupItem & { onClick: (id: number, add: boolean) => void };
const Well: React.FC<WellProps> = (p: WellProps) => {
    return (
        <div className={css.optimizationWells__well}>
            <Checkbox isChecked={p.selected} onChange={() => p.onClick(p.id, !p.selected)}>
                {p.name}
            </Checkbox>
        </div>
    );
};
