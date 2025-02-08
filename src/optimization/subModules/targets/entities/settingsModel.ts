export class SettingsModel {
    percentLimit: number;
    horizon: number;
    showPredictionChart: boolean;

    public constructor() {
        this.percentLimit = 25;
        this.horizon = 100;
        this.showPredictionChart = true;
    }
}
