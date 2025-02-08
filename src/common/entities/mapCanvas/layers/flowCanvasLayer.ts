import * as R from 'ramda';

import colors from '../../../../../theme/colors';
import { shallowEqual } from '../../../helpers/compare';
import { myInterpolate } from '../../../helpers/d3helper';
import { isNullOrEmpty } from '../../../helpers/ramda';
import { CanvasSize } from '../../canvas/canvasSize';
import { CommonCanvas } from '../../canvas/commonCanvas';
import { InitMapModel, MapModel } from '../mapModel';
import { MapLayer } from './mapLayer';

// todo mb
// const colors = [
//     'rgba(0,0,255,0.3)',
//     'rgba(0,255,0,0.3)',
//     'rgba(255,0,0,0.3)',
//     'rgba(255,150,0,0.3)',
//     'rgba(0,150,250,0.3)',
//     'rgba(150,0,250,0.3)',
//     'rgba(250,0,150,0.3)'
// ];

// TODO: необходимо разобраться с типами для defaultFlow. Где-то используется как number[][][][], где-то как number[][][]
export class FlowCanvasLayer extends CommonCanvas implements MapLayer {
    public defaultFlows: number[][][][];
    public show: boolean;
    public canvasSize: CanvasSize;

    private flows: number[][][][];

    public constructor(defaultFlows: number[][][][], show: boolean, canvasSize: CanvasSize) {
        super(canvasSize);

        this.defaultFlows = defaultFlows;
        this.show = show;
        this.canvasSize = canvasSize;
    }

    public equals(other: FlowCanvasLayer): boolean {
        if (R.isNil(other)) {
            return false;
        }

        return (
            shallowEqual(this.defaultFlows, other.defaultFlows) &&
            shallowEqual(this.show, other.show) &&
            shallowEqual(this.canvasSize, other.canvasSize)
        );
    }

    public initLayer = (model: InitMapModel): void => {
        if (R.isNil(this.defaultFlows)) {
            return;
        }

        this.setCanvasScale(model?.scale);

        this.flows = R.reject(
            (it: number[][][]) => it.length === 0,
            R.map(
                well =>
                    R.map(
                        flows =>
                            myInterpolate(R.map(flow => [this.cx(flow[0]), this.cy(flow[1]), flow[2], flow[3]], flows)),
                        well
                    ),
                this.defaultFlows
            )
        );
    };

    private zoomFactor = (k: number) => k * 0.2 * this.canvasScale;

    public render = (model: MapModel): void => {
        if (model.isMinimap) {
            return;
        }

        if (!this.show || isNullOrEmpty(this.flows)) {
            return;
        }

        model.context.save();

        for (const well of this.flows) {
            for (const flows of well) {
                const f = flows[0];

                model.context.beginPath();

                for (const p of flows) {
                    const [x, y] = model.transform.apply([p[0], p[1]]);

                    model.context.lineTo(x, y);
                }

                model.context.lineWidth = this.zoomFactor(model.transform.k);
                model.context.strokeStyle = f[3] === 1 ? colors.colors.blue : colors.colors.brown;
                model.context.stroke();
            }
        }

        model.context.restore();
    };
}

// const getColor = (index: number) => {
//     return colors[index % colors.length];
// };
