import React from 'react';

import { createIcon } from '@chakra-ui/react';

export const EmptyIcon = createIcon({
    displayName: 'EmptyIcon',
    viewBox: '0 0 24 24',
    path: <rect x='0' y='0' width='24' height='24' opacity='0' />
});

export const EllipseIcon = createIcon({
    displayName: 'EllipseIcon',
    viewBox: '0 0 8 8',
    path: <circle cx='4' cy='4' r='4' fill='currentColor' />
});

export const ActiveStepIcon = createIcon({
    displayName: 'ActiveStepIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fillRule='evenodd'
                fill='currentColor'
                d='M15.455 3.846A2 2 0 0013.822 3H5a2 2 0 00-2 2v14a2 2 0 002 2h8.78a2 2 0 001.67-.899l4.798-7.271a2 2 0 00-.037-2.256l-4.756-6.728zM5 5v14h8.78l4.798-7.271L13.822 5H5z'
            />
            <path fill='currentColor' d='M14 12a3 3 0 11-6 0 3 3 0 016 0z' />
        </>
    )
});

export const AddIcon = createIcon({
    displayName: 'AddIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fillRule='evenodd'
                fill='currentColor'
                d='M12 19a7 7 0 100-14 7 7 0 000 14zm0 2a9 9 0 100-18 9 9 0 000 18z'
            />
            <path fill='currentColor' d='M7 12a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z' />
            <path fill='currentColor' d='M12 17a1 1 0 01-1-1V8a1 1 0 112 0v8a1 1 0 01-1 1z' />
        </>
    )
});

export const ArrowDownSmallIcon = createIcon({
    displayName: 'ArrowDownSmallIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path fill='currentColor' d='M12 14l-4-4h8l-4 4z' />
            <path
                fill='currentColor'
                d='M7.076 9.617A1 1 0 018 9h8a1 1 0 01.707 1.707l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 01-.217-1.09zM10.414 11L12 12.586 13.586 11h-3.172z'
            />
        </>
    )
});

export const ArrowDownUpSmallIcon = createIcon({
    displayName: 'ArrowDownUpSmallIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path fill='currentColor' d='M12 21l-4-4h8l-4 4z' />
            <path
                fill='currentColor'
                d='M7.076 16.617A1 1 0 018 16h8a1 1 0 01.707 1.707l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 01-.217-1.09zM10.414 18L12 19.586 13.586 18h-3.172z'
            />
            <path fill='currentColor' d='M12 3l4 4H8l4-4z' />
            <path
                fill='currentColor'
                d='M16.924 7.383A1 1 0 0116 8H8a1 1 0 01-.707-1.707l4-4a1 1 0 011.414 0l4 4a1 1 0 01.217 1.09zM13.586 6L12 4.414 10.414 6h3.172z'
            />
        </>
    )
});

export const ArrowLeftIcon = createIcon({
    displayName: 'ArrowLeftIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <rect
                x='23.5'
                y='23.5'
                width='23'
                height='23'
                rx='11.5'
                transform='rotate(180 23.5 23.5)'
                fill='#FFFFFF'
                stroke='black'
            />
            <path
                d='M8 12L14 8L14 16L8 12Z'
                fill='#949495'
                stroke='#949495'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </>
    )
});

export const ArrowRightIcon = createIcon({
    displayName: 'ArrowRightIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <rect x='0.5' y='0.5' width='23' height='23' rx='11.5' fill='#FFFFFF' stroke='black' />
            <path
                d='M16 12L10 16L10 8L16 12Z'
                fill='#949495'
                stroke='#949495'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </>
    )
});

export const ArrowDownIcon = createIcon({
    displayName: 'ArrowDownIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <rect
                x='23.5'
                y='0.5'
                width='23'
                height='23'
                rx='11.5'
                transform='rotate(90 23.5 0.5)'
                fill='#FFFFFF'
                stroke='black'
            />
            <path
                d='M12 16L8 10L16 10L12 16Z'
                fill='#949495'
                stroke='#949495'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </>
    )
});

export const ArrowRightSmallIcon = createIcon({
    displayName: 'ArrowRightSmallIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path fill='currentColor' d='M14 12l-4 4V8l4 4z' />
            <path
                fill='currentColor'
                d='M9.617 16.924A1 1 0 019 16V8a1 1 0 011.707-.707l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.09.217zM11 13.586L12.586 12 11 10.414v3.172z'
            />
        </>
    )
});

export const ChartIcon = createIcon({
    displayName: 'ChartIcon',
    viewBox: '0 0 24 24',
    d: 'M6 9.99h2v7H6v-7zm8 3h2v4h-2v-4zm-4-6h2v10h-2v-10zM20 7V4h-2v3h-3v2h3v3h2V9h3V7h-3zm-2 12H4V5h12V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5h-2v5z'
});

export const CloseIcon = createIcon({
    displayName: 'CloseIcon',
    viewBox: '0 0 24 24',
    d: 'M16.708 8.704a1 1 0 00-1.414-1.414L12 10.585 8.707 7.29a1 1 0 10-1.415 1.414L10.586 12l-3.294 3.294a1 1 0 101.415 1.414L12 13.413l3.294 3.294a1 1 0 001.414-1.414L13.414 12l3.294-3.295z'
});

export const CompleteIcon = createIcon({
    displayName: 'CompleteIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fillRule='evenodd'
                fill='currentColor'
                d='M12 19a7 7 0 100-14 7 7 0 000 14zm0 2a9 9 0 100-18 9 9 0 000 18z'
            />
            <path
                fill='currentColor'
                d='M16.696 8.282a1 1 0 01.022 1.414l-4.846 5a1 1 0 01-1.436 0l-2.154-2.222a1 1 0 011.436-1.392l1.436 1.481 4.128-4.259a1 1 0 011.414-.022z'
            />
        </>
    )
});

export const DateIcon = createIcon({
    displayName: 'DateIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fillRule='evenodd'
                fill='currentColor'
                d='M5 5v14h14V5H5zM4 3a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H4z'
            />
            <path
                fill='currentColor'
                d='M7 16a1 1 0 112 0 1 1 0 01-2 0zM7 12a1 1 0 112 0 1 1 0 01-2 0zM11 16a1 1 0 112 0 1 1 0 01-2 0zM11 12a1 1 0 112 0 1 1 0 01-2 0zM15 16a1 1 0 112 0 1 1 0 01-2 0zM15 12a1 1 0 112 0 1 1 0 01-2 0zM6 2a1 1 0 012 0v2a1 1 0 01-2 0V2zM16 2a1 1 0 112 0v2a1 1 0 11-2 0V2zM5 9a1 1 0 110-2h14a1 1 0 110 2H5z'
            />
        </>
    )
});

export const EditIcon = createIcon({
    displayName: 'EditIcon',
    viewBox: '0 0 24 24',
    d: 'M19.4 7.34L16.66 4.6A2 2 0 0014 4.53l-9 9a2 2 0 00-.57 1.21L4 18.91A1 1 0 005 20h.09l4.17-.38a2 2 0 001.21-.57l9-9a1.92 1.92 0 00-.07-2.71zM9.08 17.62l-3 .28.27-3L12 9.32l2.7 2.7-5.62 5.6zM16 10.68L13.32 8l1.95-2L18 8.73l-2 1.95z'
});

export const ErrorIcon = createIcon({
    displayName: 'ErrorIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fillRule='evenodd'
                fill='currentColor'
                d='M12 19a7 7 0 100-14 7 7 0 000 14zm0 2a9 9 0 100-18 9 9 0 000 18z'
            />
            <path fill='currentColor' d='M7 12a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z' />
        </>
    )
});

export const ExcelIcon = createIcon({
    displayName: 'ExcelIcon',
    viewBox: '0 0 24 24',
    d: 'M15.111 4L19 8v11.206c0 .21-.082.413-.227.562a.761.761 0 01-.545.232H5.772a.767.767 0 01-.544-.234.812.812 0 01-.228-.56V4.794C5 4.355 5.346 4 5.772 4h9.34zm-2.178 8l2.178-3.2h-1.867L12 10.629 10.756 8.8H8.889l2.178 3.2-2.178 3.2h1.867L12 13.371l1.244 1.829h1.867L12.933 12z'
});

export const FavoriteIcon = createIcon({
    displayName: 'FavoriteIcon',
    viewBox: '0 0 24 24',
    d: 'M10.219 3.29c.742-1.454 2.82-1.454 3.562 0l1.876 3.676 4.076.648c1.612.257 2.254 2.234 1.1 3.389l-2.916 2.92.643 4.076c.255 1.613-1.427 2.834-2.882 2.094L12 18.222l-3.678 1.871c-1.455.74-3.137-.481-2.882-2.094l.643-4.076-2.916-2.92c-1.154-1.155-.512-3.132 1.1-3.389l4.076-.648 1.876-3.675zm3.657 4.585L12 4.2l-1.876 3.675a2 2 0 01-1.467 1.067l-4.075.648 2.916 2.92a2 2 0 01.56 1.724l-.643 4.076 3.678-1.87a2 2 0 011.814 0l3.678 1.87-.643-4.076a2 2 0 01.56-1.725l2.916-2.92-4.075-.647a2 2 0 01-1.467-1.067z'
});

export const InfoIcon = createIcon({
    displayName: 'InfoIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fillRule='evenodd'
                fill='currentColor'
                d='M12 5c-3.861 0-7 3.139-7 7s3.139 7 7 7 7-3.139 7-7-3.139-7-7-7zm0-2c-4.966 0-9 4.034-9 9s4.034 9 9 9 9-4.034 9-9-4.034-9-9-9z'
            />
            <path fill='currentColor' d='M12 10a1 1 0 011 1v5.214a1 1 0 11-2 0V11a1 1 0 011-1z' />
            <path fill='currentColor' d='M13 8a1 1 0 11-2 0 1 1 0 012 0z' />
        </>
    )
});

export const InfoPressedIcon = createIcon({
    displayName: 'InfoPressedIcon',
    viewBox: '0 0 24 24',
    d: 'M12 3c-4.966 0-9 4.034-9 9s4.034 9 9 9 9-4.034 9-9-4.034-9-9-9zm1 5a1 1 0 11-2 0 1 1 0 012 0zm-1 2a1 1 0 011 1v5.214a1 1 0 11-2 0V11a1 1 0 011-1z'
});

export const MailIcon = createIcon({
    displayName: 'MailIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fillRule='evenodd'
                fill='currentColor'
                d='M5 17h14V7H5v10zm0 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
            />
            <path
                fill='currentColor'
                d='M10.024 12.6L3.341 6.752l1.317-1.505 6.683 5.848a1 1 0 001.318 0l6.682-5.848 1.317 1.505-6.683 5.848a3 3 0 01-3.95 0z'
            />
        </>
    )
});

export const MenuIcon = createIcon({
    displayName: 'MenuIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fill='currentColor'
                d='M4 5a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1zM10 12a1 1 0 011-1h8a1 1 0 110 2h-8a1 1 0 01-1-1z'
            />
            <path
                fill='currentColor'
                d='M8.707 8.293a1 1 0 010 1.414L6.414 12l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z'
            />
            <path fill='currentColor' d='M4 19a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1z' />
        </>
    )
});

export const MoreIcon = createIcon({
    displayName: 'MoreIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <circle cx='5' cy='12' r='2' />
            <circle cx='12' cy='12' r='2' />
            <circle cx='19' cy='12' r='2' />
        </>
    )
});

export const NextIcon = createIcon({
    displayName: 'NextIcon',
    viewBox: '0 0 24 24',
    d: 'M10.707 11.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L8.586 12 6.293 9.707a1 1 0 011.414-1.414l3 3zM17.707 11.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 12l-2.293-2.293a1 1 0 011.414-1.414l3 3z'
});

export const NextStepIcon = createIcon({
    displayName: 'NextStepIcon',
    viewBox: '0 0 24 24',
    path: (
        <path
            fillRule='evenodd'
            fill='currentColor'
            d='M15.455 3.846A2 2 0 0013.822 3H5a2 2 0 00-2 2v14a2 2 0 002 2h8.78a2 2 0 001.67-.899l4.798-7.271a2 2 0 00-.037-2.256l-4.756-6.728zM5 5v14h8.78l4.798-7.271L13.822 5H5z'
        />
    )
});

export const PinIcon = createIcon({
    displayName: 'PinIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <rect opacity='0.05' x='0' y='0' width='24' height='24' rx='3' fill='currentColor' />
            <path d='M11 11.965a5.002 5.002 0 011-9.9 5 5 0 011 9.9v9.1a1 1 0 01-2 0v-9.1z' fill='currentColor' />
        </>
    )
});

export const UnpinIcon = createIcon({
    displayName: 'UnpinIcon',
    viewBox: '0 0 24 24',
    d: 'M7.981 10.026A5.002 5.002 0 0011 11.965v9.1a1 1 0 002 0v-9.1a5 5 0 00-1-9.9 5.002 5.002 0 00-4.019 7.96zM12 10a3 3 0 100-6 3 3 0 000 6z'
});

export const RemoveIcon = createIcon({
    displayName: 'RemoveIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fillRule='evenodd'
                fill='currentColor'
                d='M12 19a7 7 0 100-14 7 7 0 000 14zm0 2a9 9 0 100-18 9 9 0 000 18z'
            />
            <path
                fill='currentColor'
                d='M8.464 8.464a1 1 0 011.415 0l5.657 5.657a1 1 0 11-1.415 1.415L8.464 9.879a1 1 0 010-1.415z'
            />
            <path
                fill='currentColor'
                d='M8.464 15.536a1 1 0 010-1.415l5.657-5.657a1 1 0 111.415 1.415l-5.657 5.657a1 1 0 01-1.415 0z'
            />
        </>
    )
});

export const SearchIcon = createIcon({
    displayName: 'SearchIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fill='currentColor'
                d='M10.5 5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM3 10.5a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z'
            />
            <path
                fill='currentColor'
                d='M15.293 15.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414z'
            />
        </>
    )
});

export const SettingsIcon = createIcon({
    displayName: 'SettingsIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path fill='currentColor' d='M12 9a3 3 0 100 6 3 3 0 000-6z' />
            <path
                fill='currentColor'
                d='M9.903 2.221a10.108 10.108 0 014.193 0 1.531 1.531 0 011.188 1.22l.39 2.123c.003.016.013.03.026.04.01.006.02.01.032.01l.022-.005.041-.011 2-.712h.001a1.532 1.532 0 011.648.41 9.982 9.982 0 012.108 3.623v.002a1.528 1.528 0 01-.469 1.64l-1.653 1.397a.054.054 0 00-.014.065.053.053 0 00.014.019l.002.001 1.651 1.396a1.53 1.53 0 01.47 1.64 9.985 9.985 0 01-2.104 3.623l-.003.003a1.535 1.535 0 01-1.646.41l-2.039-.726a.065.065 0 00-.086.049s0-.001 0 0l-.39 2.122a1.528 1.528 0 01-1.186 1.217 10.112 10.112 0 01-4.195 0l.005.001.203-.979-.208.978a1.53 1.53 0 01-1.188-1.217v-.003l-.387-2.122.983-.181-.984.179v.002a.062.062 0 00-.082-.047h-.003l-2.038.726-.337-.941.335.942.002-.001a1.535 1.535 0 01-1.649-.41v-.001A9.979 9.979 0 012.45 15.08a1.53 1.53 0 01.468-1.64l1.652-1.397a.056.056 0 000-.086l-1.652-1.396.645-.764-.646.763a1.525 1.525 0 01-.467-1.64 9.985 9.985 0 012.103-3.622l.002-.002a1.532 1.532 0 011.648-.41l-.336.942.337-.942 2.037.726a.065.065 0 00.085-.049v.004l.983.18-.983-.184.388-2.122a1.53 1.53 0 011.19-1.22s-.001 0 0 0zm5.937 3.365zm-5.217-1.467l-.331 1.812A2.065 2.065 0 017.57 7.496l-1.74-.62a7.985 7.985 0 00-1.375 2.365L5.86 10.43a2.058 2.058 0 010 3.142L4.455 14.76a7.979 7.979 0 001.376 2.365l1.739-.618.001-.001a2.063 2.063 0 012.725 1.568v.001l.329 1.805c.91.157 1.841.157 2.752 0l.332-1.806v-.004a2.066 2.066 0 012.723-1.564l1.74.62a7.982 7.982 0 001.375-2.366l-1.405-1.187a2.055 2.055 0 010-3.143v-.001l1.405-1.187a7.978 7.978 0 00-1.378-2.365l-1.739.619h-.002c-.017.007-.031.011-.035.012l-.015.005-.013.004-.01.003-.012.003-.022.006-.058.015-.076.02-.007.002h-.004l-.006.002-.013.003a.968.968 0 01-.05.01 2.062 2.062 0 01-2.4-1.65v-.003l-.331-1.808a8.108 8.108 0 00-2.753 0zm3.061 15.702zm-3.37-.001h.005-.005zM5.531 17.23h.002z'
            />
        </>
    )
});

export const WarningIcon = createIcon({
    displayName: 'WarningIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fillRule='evenodd'
                fill='currentColor'
                d='M12 5.031l-8.554 14.97h17.108L12 5.03zm.868-2.512a1 1 0 00-1.736 0L.855 20.504A1 1 0 001.723 22h20.554a1 1 0 00.868-1.496L12.868 2.519z'
            />
            <path fill='currentColor' d='M12 16a1 1 0 01-1-1v-5a1 1 0 112 0v5a1 1 0 01-1 1z' />
            <path fill='currentColor' d='M11 18a1 1 0 112 0 1 1 0 01-2 0z' />
        </>
    )
});

export const PlusIcon = createIcon({
    displayName: 'PlusIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <rect width='2' height='12' x='11' y='6' rx='1' fill='currentColor' />
            <rect width='2' height='12' x='6' y='13' rx='1' transform='rotate(-90 6 13)' fill='currentColor' />
        </>
    )
});

export const MinusIcon = createIcon({
    displayName: 'MinusIcon',
    viewBox: '0 0 24 24',
    path: <rect x='6' y='13' width='2' height='12' rx='1' transform='rotate(-90 6 13)' fill='currentColor' />
});

export const ReloadIcon = createIcon({
    displayName: 'ReloadIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                d='M18.7081 5.99975C18.3398 5.58823 17.7076 5.55321 17.296 5.92153C16.8845 6.28986 16.8495 6.92205 17.2178 7.33358L18.7081 5.99975ZM19 12C19 15.866 15.866 19 12 19L12 21C16.9706 21 21 16.9706 21 12L19 12ZM17.2178 7.33358C18.3268 8.57268 19 10.2065 19 12L21 12C21 9.69558 20.1326 7.59136 18.7081 5.99975L17.2178 7.33358ZM12 19C11.7028 19 11.4104 18.9815 11.1237 18.9458L10.8763 20.9304C11.2448 20.9764 11.6199 21 12 21L12 19Z'
                fill='currentColor'
            />
            <path
                d='M5.29191 18.0002C5.66024 18.4118 6.29244 18.4468 6.70396 18.0785C7.11549 17.7101 7.15051 17.0779 6.78218 16.6664L5.29191 18.0002ZM5 12C5 8.13401 8.13401 5 12 5V3C7.02944 3 3 7.02944 3 12H5ZM6.78218 16.6664C5.67316 15.4273 5 13.7935 5 12H3C3 14.3044 3.86739 16.4086 5.29191 18.0002L6.78218 16.6664ZM12 5C12.2972 5 12.5896 5.01846 12.8763 5.05421L13.1237 3.06958C12.7552 3.02362 12.3801 3 12 3V5Z'
                fill='currentColor'
            />
            <path
                d='M11 1L14 4L11 7'
                stroke='currentColor'
                stroke-width='2'
                stroke-linecap='round'
                stroke-linejoin='round'
            />
            <path
                d='M14 23L11 20L14 17'
                stroke='currentColor'
                stroke-width='2'
                stroke-linecap='round'
                stroke-linejoin='round'
            />
        </>
    )
});

export const HomeIcon = createIcon({
    displayName: 'HomeIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                d='M19 20L5 20C4.44772 20 4 19.5523 4 19L4 10.1783C4 9.85361 4.15763 9.54914 4.42275 9.36172L11.1513 4.6052L10.5741 3.78863L11.1513 4.6052C11.4877 4.36741 11.9354 4.36022 12.2793 4.58708L19.5507 9.38469C19.8312 9.56975 20 9.88333 20 10.2194L20 19C20 19.5523 19.5523 20 19 20Z'
                stroke='currentColor'
                stroke-width='2'
                fill='none'
            />
            <path
                d='M15 18C15 18.7684 15 20 15 21C14 21 9.88848 21 8.99998 21C8.99999 20 9 19.6569 9 18C9 16.3431 10.3431 15 12 15C13.6568 15 15 16.3431 15 18Z'
                fill='currentColor'
            />
        </>
    )
});
