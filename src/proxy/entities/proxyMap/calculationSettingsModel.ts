import { Point } from '../../../common/entities/canvas/point';

export class CalculationSettingsModel {
    public calcInterwellConnections: boolean;
    public checkedMitchell: boolean;
    public checkedPoisson: boolean;
    public checkedSevenPoint: boolean;
    public checkedSquare: boolean;
    public cleanAllData: boolean;
    public clearCalcGrid: boolean;
    public contourIndent: number;
    public countLoop: number;
    public countStep: number;
    public distance: number;
    public drillingRate: number;
    public drillingStartDate: Date;
    public horizontalCalculation: boolean;
    public minDistanceToLicense: number;
    public numberMitchell: number;
    public numberPoisson: number;
    public numberSevenPoint: number;
    public numberSquare: number;
    public oilFieldId: number;
    public plastId: number;
    public scenarioId: number;
    public productionObjectId: number;
    public selectedPolygon: Array<Point>;
    public step: number;
    public useContour: boolean;
    public useDevelopmentMode: boolean;

    public constructor() {
        this.calcInterwellConnections = false;
        this.checkedMitchell = true;
        this.checkedPoisson = true;
        this.checkedSevenPoint = true;
        this.checkedSquare = true;
        this.cleanAllData = true;
        this.clearCalcGrid = true;
        this.contourIndent = 250;
        this.countLoop = 1;
        this.countStep = 4;
        this.distance = 450;
        this.drillingRate = 1;
        this.horizontalCalculation = false;
        this.minDistanceToLicense = 50;
        this.numberMitchell = 5;
        this.numberPoisson = 5;
        this.numberSevenPoint = 5;
        this.numberSquare = 5;
        this.selectedPolygon = [];
        this.step = 50;
        this.useContour = false;
        this.useDevelopmentMode = true;
    }
}

export interface InterwellsCalculationParams {
    deadRadius: number;
    radius: number;
    searchAngle: number;
    intermediateWells: boolean;
}

export interface AquiferCalculationParams {
    indentWaterOilContact: number;
}

export interface GeologicalReservesCalculationParams {
    volumePoreReservoir: number;
    geologicalReserves: number;
    porosity: number;
    permeability: number;
    oilSaturation: number;
    currentVolumeReservoir: number;
    typeReserves: number;
}

export const getDefaultInterwellsCalculationParams = (): InterwellsCalculationParams => ({
    deadRadius: 150,
    radius: 600,
    searchAngle: 40,
    intermediateWells: false
});
