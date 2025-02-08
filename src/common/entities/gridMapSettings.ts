/* eslint-disable @typescript-eslint/no-explicit-any */
import { IsolineModel } from './mapCanvas/isolineModel';

export class GridMapSettings {
    public isolines: any;
    public isolineSettings: IsolineModel;
    public grids: number[][];
    public image: any;
    public stepSize: number;
    public scaleRange: number[];

    constructor() {
        this.isolines = [];
        this.isolineSettings = null;
        this.grids = [];
        this.stepSize = 50;
        this.image = null;
        this.scaleRange = null;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static fromRaw(raw: any): GridMapSettings {
        const img = new Image();
        img.src = 'data:image/png;base64,' + raw.image;

        return {
            isolines: raw.isolines,
            isolineSettings: raw.isolineSettings,
            grids: raw.grid,
            stepSize: raw.canvas.size,
            image: raw.image ? img : null,
            scaleRange:
                raw.scaleRange && raw.scaleRange.min !== raw.scaleRange.max
                    ? [raw.scaleRange.min, raw.scaleRange.max]
                    : null
        };
    }
}
