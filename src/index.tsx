import React, { Suspense } from 'react';

import { ChakraProvider } from '@chakra-ui/react';
import { RecoilRoot } from 'recoil';
import { I18nextProvider } from 'react-i18next';
import i18n from './common/helpers/i18n';
import ReactDOM from 'react-dom';

import theme from './../theme';

// TIP: полифил необходим для работы Recharts, которые используют Array.prototype.find
import 'core-js/features/array/find';

// TIP: полифил необходим для работы карты 
import 'core-js/features/object/assign';

import './app/styles/common/index.less';

import { createRoot } from 'react-dom/client';

import { appRouter } from './common/helpers/history';
import { RouterProvider } from 'react-router-dom';
import { Spinner } from './common/components/spinner';

const container = document.getElementById('shell');

if (!container) {
    throw new Error("Container not found");
}

const root = createRoot(container);

const skeleton = ( 
    <ChakraProvider theme={theme}>
        <RecoilRoot>
            <I18nextProvider i18n={i18n}>
                <Suspense fallback={<Spinner />}>
                    <RouterProvider router={appRouter} fallbackElement={<Spinner />} /*future={{ v7_startTransition: true }}*/ />
                </Suspense>
            </I18nextProvider>
        </RecoilRoot>
    </ChakraProvider>
);

//root.render(skeleton); // react 18
ReactDOM.render(skeleton, container); // react 17