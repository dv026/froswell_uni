import React from 'react';

import { createIcon } from '@chakra-ui/react';

export const ArrowDownIcon = createIcon({
    displayName: 'ArrowDownIcon',
    viewBox: '0 0 24 24',
    d: 'M5.293 8.293a1 1 0 011.414 0L12 13.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z'
});

export const ArrowUpIcon = createIcon({
    displayName: 'ArrowUpIcon',
    viewBox: '0 0 24 24',
    d: 'M11.293 8.293a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L12 10.414l-5.293 5.293a1 1 0 01-1.414-1.414l6-6z'
});

export const DownIcon = createIcon({
    displayName: 'DownIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path fill='currentColor' d='M12 18a1 1 0 01-1-1V5a1 1 0 112 0v12a1 1 0 01-1 1z' />
            <path
                fill='currentColor'
                d='M8.293 15.293a1 1 0 011.414 0L12 17.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
            />
        </>
    )
});

export const DropIcon = createIcon({
    displayName: 'DropIcon',
    viewBox: '0 0 24 24',
    d: 'M12 4c4 4.872 6 8.338 6 10.4 0 .735-.155 1.464-.457 2.143a5.591 5.591 0 01-1.3 1.817 6.044 6.044 0 01-1.947 1.214A6.373 6.373 0 0112 20a6.373 6.373 0 01-2.296-.426 6.045 6.045 0 01-1.947-1.214 5.59 5.59 0 01-1.3-1.817A5.277 5.277 0 016 14.4C6 12.338 8 8.872 12 4z'
});

export const DropAndDownIcon = createIcon({
    displayName: 'DropAndDownIcon',
    viewBox: '0 0 24 24',
    d: 'M13 4.194c4 4.857 6 8.359 6 10.506 0 .827-.181 1.647-.533 2.41a6.3 6.3 0 01-1.517 2.045 7.097 7.097 0 01-2.271 1.365A7.68 7.68 0 0112 21a7.68 7.68 0 01-2.679-.48 7.097 7.097 0 01-2.27-1.365 6.3 6.3 0 01-1.518-2.044A5.757 5.757 0 015 14.7c0-2.147 2-5.65 6-10.506v10.392l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L13 14.586V4.194z'
});

export const DropTimeIcon = createIcon({
    displayName: 'DropTimeIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fill='currentColor'
                d='M5 12c0-3.861 3.139-7 7-7 3.506 0 6.416 2.587 6.922 5.954.77 1.057 1.403 2.025 1.887 2.899A9.02 9.02 0 0021 12c0-4.966-4.034-9-9-9s-9 4.034-9 9 4.034 9 9 9a9 9 0 00.25-.003 5.48 5.48 0 01-1.058-2.043C7.71 18.552 5 15.588 5 12z'
            />
            <path
                fill='currentColor'
                d='M16.5 11c2.334 3.045 3.5 5.212 3.5 6.5a3.5 3.5 0 11-7 0c0-1.288 1.166-3.455 3.5-6.5z'
            />
            <path
                fill='currentColor'
                d='M12.894 11.553a1 1 0 01-.447 1.341l-4 2a1 1 0 11-.894-1.789l4-2a1 1 0 011.341.448z'
            />
            <path fill='currentColor' d='M14 12a2 2 0 11-4 0 2 2 0 014 0z' />
        </>
    )
});

export const ModelIcon = createIcon({
    displayName: 'ModelIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fill='currentColor'
                d='M18 7a2 2 0 114 0 2 2 0 01-4 0zM2 7a2 2 0 114 0 2 2 0 01-4 0zM12 9a2 2 0 100 4 2 2 0 000-4zM12 1a2 2 0 100 4 2 2 0 000-4zM12 19a2 2 0 100 4 2 2 0 000-4z'
            />
            <path fill='currentColor' d='M12 10a1 1 0 011 1v9a1 1 0 11-2 0v-9a1 1 0 011-1z' />
            <path
                fill='currentColor'
                d='M20.894 6.553a1 1 0 01-.447 1.341l-8 4a1 1 0 11-.894-1.789l8-4a1 1 0 011.341.448z'
            />
            <path
                fill='currentColor'
                d='M20.894 7.447a1 1 0 00-.447-1.341l-8-4a1 1 0 10-.894 1.788l8 4a1 1 0 001.341-.447zM3.106 6.553a1 1 0 00.447 1.341l8 4a1 1 0 10.894-1.789l-8-4a1 1 0 00-1.341.448z'
            />
            <path
                fill='currentColor'
                d='M3.106 7.447a1 1 0 01.447-1.341l8-4a1 1 0 11.894 1.788l-8 4a1 1 0 01-1.341-.447zM20.894 16.553a1 1 0 01-.447 1.341l-8 4a1 1 0 11-.894-1.788l8-4a1 1 0 011.341.447z'
            />
            <path
                fill='currentColor'
                d='M3.106 16.553a1 1 0 00.447 1.341l8 4a1 1 0 10.894-1.788l-8-4a1 1 0 00-1.341.447zM20 6a1 1 0 011 1v10a1 1 0 11-2 0V7a1 1 0 011-1z'
            />
            <path fill='currentColor' d='M4 6a1 1 0 011 1v10a1 1 0 11-2 0V7a1 1 0 011-1z' />
        </>
    )
});

export const OilIcon = createIcon({
    displayName: 'OilIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path fill='currentColor' d='M13 1a1 1 0 10-2 0v1a1 1 0 102 0V1z' />
            <path
                fill='currentColor'
                d='M12 5a1 1 0 011 1v1h1.674a2 2 0 011.964 1.622l2.344 12.19c.012.063.018.126.018.188h1a1 1 0 110 2H4a1 1 0 110-2h1c0-.062.006-.125.018-.189L7.362 8.622A2 2 0 019.326 7H11V6a1 1 0 011-1zm4.64 14.226l-1.04-5.412L13.414 16l3.227 3.226zM15.587 21L12 17.414 8.414 21h7.172zM12 14.586l3.144-3.144L14.674 9H9.326l-.47 2.442L12 14.586zm-3.6-.772l-1.04 5.412L10.585 16 8.4 13.814z'
            />
            <path
                fill='currentColor'
                d='M1.51 8.142C.883 3.754 5.286.82 9.394 2.58a1 1 0 11-.788 1.838c-2.892-1.24-5.49.827-5.116 3.44a1 1 0 01-1.98.283zM14.606 2.525c4.108-1.76 8.51 1.173 7.884 5.56a1 1 0 11-1.98-.282c.373-2.613-2.224-4.68-5.116-3.44a1 1 0 01-.788-1.838z'
            />
        </>
    )
});

export const WellPlaySimpleIcon = createIcon({
    displayName: 'WellPlaySimpleIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                fill='currentColor'
                d='M9 15.2246V8.62535C9 7.88021 9.78569 7.39681 10.4508 7.73274L16.3902 10.7324C17.0911 11.0864 17.1292 12.0732 16.4576 12.4802L10.5183 16.0798C9.85186 16.4837 9 16.0039 9 15.2246Z'
            />
        </>
    )
});

export const WellPlayIcon = createIcon({
    displayName: 'WellPlayIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                opacity='0.2'
                fill='currentColor'
                d='M3 12C3 7.0341 7.0341 3 12 3C16.9659 3 21 7.0341 21 12C21 16.9659 16.9659 21 12 21C7.0341 21 3 16.9659 3 12Z'
            />
            <path
                fill='currentColor'
                d='M9 15.2246V8.62535C9 7.88021 9.78569 7.39681 10.4508 7.73274L16.3902 10.7324C17.0911 11.0864 17.1292 12.0732 16.4576 12.4802L10.5183 16.0798C9.85186 16.4837 9 16.0039 9 15.2246Z'
            />
        </>
    )
});

export const WellStopIcon = createIcon({
    displayName: 'WellStopIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                opacity='0.2'
                d='M3 12C3 7.0341 7.0341 3 12 3C16.9659 3 21 7.0341 21 12C21 16.9659 16.9659 21 12 21C7.0341 21 3 16.9659 3 12Z'
                fill='currentColor'
            />
            <rect x='8' y='8' width='8' height='8' rx='1' fill='currentColor' />
        </>
    )
});

export const WellBellIcon = createIcon({
    displayName: 'WellBellIcon',
    viewBox: '0 0 24 24',
    path: (
        <>
            <path
                opacity='0.1'
                d='M3 12C3 7.0341 7.0341 3 12 3C16.9659 3 21 7.0341 21 12C21 16.9659 16.9659 21 12 21C7.0341 21 3 16.9659 3 12Z'
                fill='currentColor'
            />
            <path
                d='M12 4C12.5523 4 13 4.44772 13 5V6.10002C15.2822 6.56329 17 8.58104 17 11V15C17.5523 15 18 15.4477 18 16C18 16.5523 17.5523 17 17 17L14 17C14 18.1046 13.1046 19 12 19C10.8954 19 10 18.1046 10 17L7 17C6.44772 17 6 16.5523 6 16C6 15.4477 6.44772 15 7 15V11C7 8.58104 8.71776 6.56329 11 6.10002V5C11 4.44772 11.4477 4 12 4ZM9 15H15V11C15 9.34315 13.6569 8 12 8C10.3431 8 9 9.34315 9 11V15Z'
                fill='currentColor'
            />
        </>
    )
});

export const WellMinusIcon = createIcon({
    displayName: 'WellMinusIcon',
    viewBox: '0 0 24 24',
    path: <rect x='6' y='13' width='2' height='12' rx='1' transform='rotate(-90 6 13)' fill='currentColor' />
});

export const HorisontIcon = createIcon({
    displayName: 'HorisontIcon',
    viewBox: '0 0 24 24',
    d: 'M11.965 13a5.002 5.002 0 0 1-9.9-1 5 5 0 0 1 9.9-1h9.1a1 1 0 1 1 0 2h-9.1Z'
});
