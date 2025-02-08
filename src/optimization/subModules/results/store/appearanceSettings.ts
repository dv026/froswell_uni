import { atom } from 'recoil';

interface AppearanceSettingsState {
    showCompensation: boolean;
    showFlowInterwells: boolean;
    showInflowProfile: boolean;
    showLiquidDistribution: boolean;
    showTrajectory: boolean;
    showTracerResearch: boolean;
    scaleLiquidDistributionByWell: boolean;
    showOpeningMode: boolean;
}

const initialState: AppearanceSettingsState = {
    showCompensation: true,
    showFlowInterwells: true,
    showInflowProfile: true,
    showLiquidDistribution: true,
    showTrajectory: false,
    showTracerResearch: true,
    scaleLiquidDistributionByWell: true,
    showOpeningMode: false
};

export const appearanceSettingsState = atom<AppearanceSettingsState>({
    key: 'optimizationMap__appearanceSettingsState',
    default: initialState
});
