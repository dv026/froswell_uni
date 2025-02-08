import { isNullOrEmpty } from '../../../common/helpers/ramda';
import { OptimisationModel } from '../proxyMap/optimisationModel';
import { OptimisationSkinFactorModel } from '../proxyMap/optimisationSkinFactorModel';

export class OptimizationChangesModel {
    public optimisation: OptimisationModel[];
    public optimisationSkinFactor: OptimisationSkinFactorModel[];

    constructor() {
        this.optimisation = [];
        this.optimisationSkinFactor = [];
    }

    public get isEmpty(): boolean {
        return isNullOrEmpty(this.optimisation) && isNullOrEmpty(this.optimisationSkinFactor);
    }
}
