import { isNullOrEmpty } from '../../../common/helpers/ramda';
import { WellPoint } from './wellPoint';

export class ModifiedImaginaryModel {
    public added: WellPoint[];
    public modified: WellPoint[];
    public deleted: number[];
    public renamed: RenameImaginaryWell[];

    public constructor() {
        this.added = [];
        this.modified = [];
        this.deleted = [];
        this.renamed = [];
    }

    public get isEmpty(): boolean {
        return (
            isNullOrEmpty(this.added) &&
            isNullOrEmpty(this.deleted) &&
            isNullOrEmpty(this.modified) &&
            isNullOrEmpty(this.renamed)
        );
    }
}

export interface RenameImaginaryWell {
    wellId: number;
    newWellId: number;
}
