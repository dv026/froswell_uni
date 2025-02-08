import { url } from '../../common/helpers/serverPath';

const controllerName: string = 'optimization';

export const optimizationUrl = (actionName: string, opts: string[] = [], query: [string, string][] = []): string =>
    url(controllerName, actionName, opts, query);
