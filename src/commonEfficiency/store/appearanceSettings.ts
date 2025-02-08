import { atom } from 'recoil';

interface AppearanceSettingsState {
    showCompensation: boolean;
    showFlowInterwells: boolean;
    showInflowProfile: boolean;
    showLiquidDistribution: boolean;
    showTrajectory: boolean;
}

const initialState: AppearanceSettingsState = {
    showCompensation: true,
    showFlowInterwells: true,
    showInflowProfile: true,
    showLiquidDistribution: true,
    showTrajectory: false
};

export const appearanceSettingsState = atom<AppearanceSettingsState>({
    key: 'efficiencyMap__appearanceSettingsState',
    default: initialState
});
