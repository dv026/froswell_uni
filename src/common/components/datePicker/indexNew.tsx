import React, { FC, forwardRef, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Stack,
    StyleObjectOrFn,
    Text,
    useTheme,
    css as chakraCSS,
    Portal,
    Button
} from '@chakra-ui/react';
import { ClassNames } from '@emotion/react';
import { isValidDate, parseRU } from 'common/helpers/date';
import { LanguageEnum } from 'common/helpers/i18n/languageEnum';
import { isNullOrEmpty } from 'common/helpers/ramda';
import { isNil } from 'ramda';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import { useTranslation } from 'react-i18next';

import { DateIcon } from '../customIcon/general';

const CustomInput = memo((props: any) => {
    const { background, disabled, placeholder, size, value, width, onClick, onChange } = props;

    const { i18n } = useTranslation();

    return (
        <InputGroup width={width ? width : 'auto'}>
            <Input
                {...props}
                pr='2.5rem'
                size={size === 'sm' ? 'sm' : 'md'}
                isInvalid={!isNullOrEmpty(value) && !isValidDate(parseRU(value))}
                isDisabled={disabled}
                placeholder={
                    placeholder ? placeholder : i18n?.language === LanguageEnum.EN ? 'dd/mm/yyyy' : 'дд.мм.гггг'
                }
                backgroundColor={background}
            />
            <InputRightElement width={size === 'sm' ? '2rem' : '2.5rem'} height={size === 'sm' ? '2rem' : '2.5rem'}>
                <Button variant='unstyled' isDisabled={disabled} onClick={onClick}>
                    <DateIcon color='icons.grey' boxSize={size === 'sm' ? 5 : 7} />
                </Button>
            </InputRightElement>
        </InputGroup>
    );
});

type DatePickerBaseProps = Pick<ReactDatePickerProps, 'minDate' | 'maxDate'>;

export interface DatePickerProps extends DatePickerBaseProps {
    selected: Date | undefined;
    disabled?: boolean;
    width?: string;
    placeholder?: string;
    autoFocus?: boolean;
    withPortal?: boolean;
    size?: string;
    onChange?: (date: Date) => void;

    /**
     * Дополнительные необязательные стили компонента
     */
    styles?: {
        background?: string;
    };
}

export const DatePicker = memo((props: DatePickerProps) => {
    const { autoFocus, disabled, maxDate, minDate, selected, withPortal, onChange } = props;

    const { i18n } = useTranslation();

    // const [selectedDate, setSelectedDate] = useState(selected);

    // useEffect(() => {
    //     setSelectedDate(selected);
    // }, [selected]);

    const onChangeHandler = (d, e) => {
        if (isNil(d) || isValidDate(d)) {
            onChange(d);
        }

        //setSelectedDate(d);
    };

    return (
        <ReactDatePicker
            strictParsing
            autoFocus={autoFocus}
            customInput={<CustomInput />}
            dateFormat={'dd.MM.yyyy'}
            disabled={disabled}
            disabledKeyboardNavigation
            locale={i18n?.language === LanguageEnum.EN ? 'en' : 'ru'}
            onChange={onChangeHandler}
            popperContainer={withPortal ? props => <Portal>{props.children}</Portal> : null}
            selected={selected}
            minDate={minDate}
            maxDate={maxDate}
        />
    );
});
