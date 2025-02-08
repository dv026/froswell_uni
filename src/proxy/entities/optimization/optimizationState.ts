import { OptimisationModel } from '../proxyMap/optimisationModel';
import { OptimisationSkinFactorModel } from '../proxyMap/optimisationSkinFactorModel';

export interface OptimizationState {
    optimisation: OptimisationModel[];
    originalOptimisation: OptimisationModel[];
    optimisationSkinFactor: OptimisationSkinFactorModel[];
    originalOptimisationSkinFactor: OptimisationSkinFactorModel[];
}
