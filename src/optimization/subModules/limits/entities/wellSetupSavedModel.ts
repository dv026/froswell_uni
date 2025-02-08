export interface WellSetupSavedModel {
    id: number;
    subScenarioId: number;
    wells: number[];
    wellType: number;
    type: number;
    minPressureZab: number;
    isManual: boolean;
}
