// TODO: типизация

/* eslint-disable @typescript-eslint/no-explicit-any */
import { WellCommentModel } from 'common/entities/mapCanvas/wellCommentModel';

import { DefaultDates } from '../../common/components/defaultDates';
import { CanvasSize } from '../../common/entities/canvas/canvasSize';
import { ContourModelBrief } from '../../common/entities/contourModelBrief';
import { GridMapSettings } from '../../common/entities/gridMapSettings';
import { KeyValue } from '../../common/entities/keyValue';
import { AccumulatedFlow } from '../../common/entities/mapCanvas/accumulatedFlow';
import { WellPointDonut } from '../../common/entities/wellPoint';
import { GridMapEnum } from '../../common/enums/gridMapEnum';

export class MapSettingModel {
    public availableGrids: GridMapEnum[];
    public canvasSize: CanvasSize;
    public contour: ContourModelBrief[];
    public drilledFoundationPoints: WellPointDonut[];
    public gridSettings: GridMapSettings;
    public krigingDefaultDates: DefaultDates;
    public mapHistoryRange: any;
    public plastDict: KeyValue[];
    public plastId: number;
    public points: WellPointDonut[];
    public fullPoints: WellPointDonut[];
    public previousGridMap: GridMapEnum;
    public prodObjDict: KeyValue[];
    public radius: number;
    public tracerResearches: AccumulatedFlow;
    public krigingPeriod: Date[];
    public pieScale: number;
    public wellComments: WellCommentModel[];

    public constructor() {
        this.points = null;
        this.radius = 1200;
        this.krigingDefaultDates = null;
        this.gridSettings = new GridMapSettings();
        this.pieScale = 1;
    }
}
