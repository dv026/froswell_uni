import React, { FC } from 'react';

import { Button, HStack, Text } from '@chakra-ui/react';
import { assoc, filter, isNil, last, map, reject, when } from 'ramda';
import { useTranslation } from 'react-i18next';

import { AddIcon, RemoveIcon } from '../../../../../common/components/customIcon/general';
import { DatePicker } from '../../../../../common/components/datePicker';
import { WellTypeEnum } from '../../../../../common/enums/wellTypeEnum';
import { isValidDate } from '../../../../../common/helpers/date';
import { isFn, isNullOrEmpty, mapIndexed } from '../../../../../common/helpers/ramda';
import { hashCode } from '../../../../../common/helpers/strings';
import { ImaginaryCharWorkHistory } from '../../../../entities/proxyMap/wellPoint';
import {
    add,
    areSoldered,
    couldBeAdded,
    eq,
    isSolderedWithNext,
    isSolderedWithPrev,
    lastNonClosedReal,
    solder
} from '../../../../helpers/charworkManager';
import { SelectWellType } from './selectWellType';

import dict from '../../../../../common/helpers/i18n/dictionary/main.json';

interface CharworkProps {
    availableCharworks: WellTypeEnum[];
    model: ImaginaryCharWorkHistory;
    nextModel: ImaginaryCharWorkHistory;
    add: () => void;
    onChangeClosingDate: (v) => void;
    onChangeStartDate: (v) => void;
    onChangeWellType: (v) => void;
    remove: () => void;
}

const Charwork: FC<CharworkProps> = (p: CharworkProps) => {
    //
    return (
        <HStack spacing={1} py={1}>
            <Button
                variant='unstyled'
                isDisabled={!isFn(p.remove)}
                onClick={() => (isFn(p.remove) ? p.remove() : null)}
                minW='auto'
            >
                <RemoveIcon boxSize={7} color='icons.red' textAlign='center' />
            </Button>
            <HStack spacing={1}>
                <DatePicker
                    selected={p.model.startDate}
                    disabled={!isFn(p.onChangeStartDate)}
                    placeholder='С'
                    onChange={p.onChangeStartDate}
                />
                <Text>-</Text>
                <DatePicker
                    autoFocus={true}
                    selected={p.nextModel ? p.nextModel.closingDate : p.model.closingDate}
                    disabled={!isFn(p.onChangeClosingDate)}
                    placeholder='По'
                    onChange={p.onChangeClosingDate}
                />
            </HStack>
            <SelectWellType
                selected={p.model.type}
                disabled={!isFn(p.onChangeWellType)}
                onChange={p.onChangeWellType}
            />
        </HStack>
    );
};

interface CharworksProps {
    charworks: ImaginaryCharWorkHistory[];
    disabled?: boolean;
    onChange: (v: ImaginaryCharWorkHistory[]) => void;
}

export const Charworks: FC<CharworksProps> = (p: CharworksProps) => {
    const { t } = useTranslation();

    if (isNullOrEmpty(p.charworks)) {
        return null;
    }

    const getStartDateHandler = (x: ImaginaryCharWorkHistory) => {
        if (p.disabled) {
            return null;
        }

        if (!x.isImaginary) {
            return null;
        }

        return (newDate: Date) =>
            p.onChange(
                map(
                    when(cw => eq(cw, x), assoc('startDate', newDate)),
                    p.charworks
                )
            );
    };

    const getClosingDateHandler = (x: ImaginaryCharWorkHistory, idx: number) => {
        if (p.disabled) {
            return null;
        }

        if (!x.isImaginary && !lastNonClosedReal(idx, p.charworks) && !isSolderedWithNext(idx, p.charworks)) {
            return null;
        }

        return lastNonClosedReal(idx, p.charworks)
            ? (newDate: Date) => p.onChange(solder(newDate, x, p.charworks))
            : (newDate: Date) =>
                  p.onChange(
                      map(
                          when(cw => eq(cw, x), assoc('closingDate', newDate)),
                          p.charworks
                      )
                  );
    };

    const getAddHandler = (idx: number) => {
        if (p.disabled) {
            return null;
        }

        if (!couldBeAdded(idx, p.charworks)) {
            return null;
        }

        const l = last(p.charworks);
        if (isValidDate(l.closingDate) && l.startDate > l.closingDate) {
            return null;
        }

        return () => p.onChange(add(p.charworks));
    };

    const getRemoveHandler = (x: ImaginaryCharWorkHistory, idx: number) => {
        if (p.disabled) {
            return null;
        }

        if (!x.isImaginary && !isSolderedWithNext(idx, p.charworks)) {
            return null;
        }

        const noSolderedVirtual = (cw: ImaginaryCharWorkHistory) => (cw.isImaginary && areSoldered(x, cw) ? null : cw);
        return lastNonClosedReal(idx, p.charworks)
            ? () => p.onChange(reject(isNil, map(noSolderedVirtual, p.charworks)))
            : () => p.onChange(reject((cw: ImaginaryCharWorkHistory) => eq(x, cw), p.charworks));
    };

    const getWellTypeHandler = (x: ImaginaryCharWorkHistory) => {
        if (p.disabled) {
            return null;
        }

        if (!x.isImaginary) {
            return null;
        }

        return (type: WellTypeEnum) =>
            p.onChange(
                map(
                    when(cw => eq(cw, x), assoc('type', type)),
                    p.charworks
                )
            );
    };

    const addHandler = getAddHandler(p.charworks.length - 1);

    return (
        <>
            {mapIndexed((x: ImaginaryCharWorkHistory, idx: number) => {
                if (isSolderedWithPrev(idx, p.charworks)) {
                    return null;
                }

                return (
                    <Charwork
                        key={hashCode(`${x.startDate}${x.isImaginary}${x.type}`)}
                        model={x}
                        nextModel={isSolderedWithNext(idx, p.charworks) ? p.charworks[idx + 1] : null}
                        onChangeClosingDate={getClosingDateHandler(x, idx)}
                        onChangeStartDate={getStartDateHandler(x)}
                        onChangeWellType={getWellTypeHandler(x)}
                        add={getAddHandler(idx)}
                        remove={getRemoveHandler(x, idx)}
                        availableCharworks={
                            x.isImaginary ? [WellTypeEnum.Oil, WellTypeEnum.Injection, WellTypeEnum.Unknown] : [x.type]
                        }
                    />
                );
            }, p.charworks)}
            {filter(it => it.isImaginary, p.charworks).length < 5 ? (
                <Button
                    variant='link'
                    leftIcon={<AddIcon boxSize={7} color='icons.grey' />}
                    isDisabled={!isFn(addHandler)}
                    onClick={() => (isFn(addHandler) ? addHandler() : null)}
                >
                    {t(dict.prediction.addPeriod)}
                </Button>
            ) : null}
        </>
    );
};
