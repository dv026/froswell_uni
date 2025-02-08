import { AquiferModel } from '../../../common/entities/aquiferModel';
import { CanvasSize } from '../../../common/entities/canvas/canvasSize';
import { ContourModelBrief } from '../../../common/entities/contourModelBrief';
import { GridMapEnum } from '../../../common/enums/gridMapEnum';
import { OptimisationParamEnum } from '../../enums/wellGrid/optimisationParam';
import { InterwellConnection } from './interwellConnection';
import { WellGroup } from './wellGroup';
import { WellPoint } from './wellPoint';

export class MapSettingModel {
    //public plastId: number;
    public points: WellPoint[];
    public imaginaryPoints: WellPoint[];
    public originalImaginaryPoints: WellPoint[];
    public intermediatePoints: WellPoint[];
    public drilledPoints: WellPoint[];
    public originalCurrentFundWithImaginary: WellPoint[];

    /**
     * Реальные скважины с виртульными характерами работы
     */
    public currentFundWithImaginary: WellPoint[];
    public contour: ContourModelBrief[];
    public canvasSize: CanvasSize;

    public virtualWells: boolean;

    /**
     * Определяет необходимость включения в расчет промежуточных скважин
     */
    public includeIntermediateWells: boolean;
    public showGrid: boolean;
    // TODO: исправить any типы
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //public gridPoints: any[];
    //public gridStepSize: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //public isolinePoints: any[];
    public optimisationSelectedParam: OptimisationParamEnum;
    public availableGrids: GridMapEnum[];

    public maxMerDate: Date;

    public efficiencyCountSteps: number;

    public interwellConnections: InterwellConnection[];

    public maxWellId: number;

    public aquifers: AquiferModel[];

    public wellGroup: WellGroup[];

    //public wellGridMode: WellGridModeEnum;

    public constructor() {
        this.points = null;
        this.imaginaryPoints = null;
        this.originalImaginaryPoints = null;
        this.intermediatePoints = null;
        this.drilledPoints = null;
        this.originalCurrentFundWithImaginary = null;
        this.showGrid = false;
        //this.gridPoints = null;
        //this.gridStepSize = 50;
        this.optimisationSelectedParam = OptimisationParamEnum.PresureZab;
        this.efficiencyCountSteps = 0;
        this.maxWellId = 1000;
        //this.wellGridMode = WellGridModeEnum.Scenarios;

        this.interwellConnections = [];
        this.wellGroup = [];
    }
}
