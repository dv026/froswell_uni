import { WellPoint } from '../../common/entities/wellPoint';

export class Interaction {
    public impact: number;
    public oilWell: WellPoint;

    public constructor(impact: number, oilWell: WellPoint) {
        this.impact = impact;
        this.oilWell = oilWell;
    }
}
