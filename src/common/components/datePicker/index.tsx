import React, { HTMLAttributes, FC, useRef, useEffect } from 'react';

import { Button, Input, InputGroup, InputRightElement, Portal } from '@chakra-ui/react';
import ru from 'date-fns/locale/ru';
import { isNil } from 'ramda';
import ReactDatePicker, { ReactDatePickerProps, registerLocale } from 'react-datepicker';
import { useTranslation } from 'react-i18next';

import { LanguageEnum } from '../../../common/helpers/i18n/languageEnum';
import { isValidDate, parseRU } from '../../helpers/date';
import { isNullOrEmpty } from '../../helpers/ramda';
import { DateIcon } from '../customIcon/general';

registerLocale('ru', ru);

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

export const DatePicker: FC<DatePickerProps & HTMLAttributes<HTMLElement>> = (
    p: DatePickerProps & HTMLAttributes<HTMLElement>
) => {
    const { i18n } = useTranslation();

    const onChangeHandler = (d: Date) => {
        if (isNil(d) || isValidDate(d)) {
            p.onChange(d);
        }
    };

    return (
        <ReactDatePicker
            autoFocus={p.autoFocus}
            customInput={<CustomInputPicker width={p.width} size={p.size} background={p.styles?.background} />}
            dateFormat={'dd.MM.yyyy'}
            disabled={p.disabled}
            disabledKeyboardNavigation
            locale={i18n?.language === LanguageEnum.EN ? 'en' : 'ru'}
            onChange={onChangeHandler}
            popperContainer={p.withPortal ? props => <Portal>{props.children}</Portal> : null}
            selected={p.selected}
            minDate={p.minDate}
            maxDate={p.maxDate}
            strictParsing={true}
        />
    );
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const CustomInputPicker: FC<any> = p => {
    const { i18n } = useTranslation();

    const datepickerRef = useRef(null);

    useEffect(() => {
        if (datepickerRef.current && p.autoFocus) {
            datepickerRef.current.focus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <InputGroup width={p.width ? p.width : 'auto'}>
            <Input
                id={p.id}
                value={p.value}
                pr='2.5rem'
                size={p.size === 'sm' ? 'sm' : 'md'}
                isInvalid={!isNullOrEmpty(p.value) && (!isValidDate(parseRU(p.value)) || p.value.length !== 10)}
                isDisabled={p.disabled}
                placeholder={
                    p.placeholder ? p.placeholder : i18n?.language === LanguageEnum.EN ? 'dd/mm/yyyy' : 'дд.мм.гггг'
                }
                onChange={d => p.onChange(d)}
                ref={datepickerRef}
                backgroundColor={p?.background}
            />
            <InputRightElement width={p.size === 'sm' ? '2rem' : '2.5rem'} height={p.size === 'sm' ? '2rem' : '2.5rem'}>
                <Button variant='unstyled' isDisabled={p.disabled} onClick={p.onClick}>
                    <DateIcon color='icons.grey' boxSize={p.size === 'sm' ? 5 : 7} />
                </Button>
            </InputRightElement>
        </InputGroup>
    );
};
