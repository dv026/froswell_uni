export enum CalculationStepEnum {
    Pending = 1,

    DataLoad = 2,

    Calculation = 3,

    DataSave = 4,

    Finished = 5,

    FinishedWithErrors = 6,

    StoppedByUser = 7,

    IsStoppingByUser = 8
}

export interface CalculationBrief {
    id: string;

    scenarioId: number;

    subScenarioId: number;

    scenarioName: string;

    subScenarioName: string;

    modelId: number;

    currentStep: CalculationStepEnum;
}

export const isCalculationInProgress = (calc: CalculationBrief): boolean =>
    calc.currentStep === CalculationStepEnum.DataLoad ||
    calc.currentStep === CalculationStepEnum.Calculation ||
    calc.currentStep === CalculationStepEnum.DataSave ||
    calc.currentStep === CalculationStepEnum.IsStoppingByUser;

export const isCalculationStarted = (calc: CalculationBrief): boolean =>
    calc.currentStep === CalculationStepEnum.Pending ||
    calc.currentStep === CalculationStepEnum.DataLoad ||
    calc.currentStep === CalculationStepEnum.Calculation ||
    calc.currentStep === CalculationStepEnum.DataSave ||
    calc.currentStep === CalculationStepEnum.IsStoppingByUser;

export const isCalculationFinished = (calc: CalculationBrief): boolean =>
    calc.currentStep === CalculationStepEnum.Finished ||
    calc.currentStep === CalculationStepEnum.FinishedWithErrors ||
    calc.currentStep === CalculationStepEnum.StoppedByUser;

export const isCalculationFinishedIncorrectly = (calc: CalculationBrief): boolean =>
    calc.currentStep === CalculationStepEnum.FinishedWithErrors ||
    calc.currentStep === CalculationStepEnum.StoppedByUser;
