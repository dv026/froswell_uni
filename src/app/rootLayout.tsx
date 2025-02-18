import { memo, Suspense } from 'react';
import React from 'react';

import { createStandaloneToast } from '@chakra-ui/react';
import { ErrorBoundaryFallbackComponent } from 'common/containers/errorBoundary/errorBoundaryFallbackComponent';
import { ErrorBoundary } from 'react-error-boundary';

import { Stairway } from '../common/components/stairway';
import { AuthOutlet } from './providers/router/ui/AuthOutlet';
import { AppProvider } from '@toolpad/core/react-router-dom';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoney';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import { DashboardLayout } from '@toolpad/core';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CalculateIcon from '@mui/icons-material/Calculate';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { createTheme } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import TimelineIcon from '@mui/icons-material/Timeline';
import AddchartIcon from '@mui/icons-material/Addchart';
const { ToastContainer } = createStandaloneToast();

const darkTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });

const RootLayout = memo(function RootLayout() {
    return (
        <ErrorBoundary FallbackComponent={ErrorBoundaryFallbackComponent} onError={console.error}>
              <AppProvider
                    branding={{
                        title: '',
                        // logo: <div><img style={{ maxHeight: '43px' }} src={'/images/logo4.png'} /></div>,
                        logo: <div><img src={'/images/logo4.png'} /></div>,
                    }}
                    theme={darkTheme}
                    navigation={NAVIGATION}>

<DashboardLayout slots={{
        // toolbarActions: null,
        toolbarAccount: () => (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center'}}>
            <div style={{ borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#90dba2', textAlign: 'center', color: 'white', fontSize: '30px'}}>CS</div>
            {/* <div style={{ borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#90dba2', textAlign: 'center', color: 'white', fontSize: '30px'}}>CS</div> */}
            <div>
            <div>
              {/* <b>{user?.name}</b> */}
              <b>Casper Seth</b>
            </div>
            <div>
              {/* {user?.email} */}
              casperseth@gmail.com
            </div>
            </div>
          </div>
        )
      }} >
              {/* <Stairway /> */}
              <AuthOutlet/>
            </DashboardLayout>
            </AppProvider>
            <ToastContainer />
        </ErrorBoundary>
    );
});

export default RootLayout;


const NAVIGATION = [
    {
      segment: 'input',
      title: 'My Data',
      icon: <FileCopyIcon />,
    },
    {
      segment: 'geological-model',
      title: 'Data Verification',
      icon: <AutorenewIcon />,
    },
    {
      segment: 'proxy/preparation',
      title: 'Data-Driven Simulation Model',
      icon: <ViewInArIcon />,
    },
    {
      segment: 'prediction/preparation',
      title: 'Prediction',
      icon: <TimelineIcon />,
    },
    {
      segment: 'optimization/preparation',
      title: 'Optimization',
      icon: <AddchartIcon />,
    },
    {
        segment: 'proxy/calculation',
        title: 'Calculation',
        icon: <CalculateIcon />,
    }
  ]
  