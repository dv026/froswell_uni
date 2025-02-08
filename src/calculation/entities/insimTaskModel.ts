import { WellBrief } from '../../common/entities/wellBrief';
import { ComputationStatus } from './computation/computationStatus';

export class InsimTaskModel {
    public key: string;
    public status: ComputationStatus;
    public well: WellBrief;
    public names: string[];
    public url: string;
    public dt: Date;

    public constructor(key: string, status: ComputationStatus, well: WellBrief, names: string[], url: string) {
        this.key = key;
        this.status = status;
        this.well = well;
        this.names = names;
        this.url = url;
        this.dt = new Date();
    }
}
