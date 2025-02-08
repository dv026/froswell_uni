import { KeyValue } from '../../common/entities/keyValue';
import { GeologicalProperties } from './geologicalProperties';
import { PhysicalProperties } from './physicalProperties';

export class OilFieldProperties {
    public plasts: Array<KeyValue>;
    public physicalProperties: Array<PhysicalProperties>;
    public geologicalProperties: Array<GeologicalProperties>;
}
