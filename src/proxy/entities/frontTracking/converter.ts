import { FrontTracking } from './frontTracking';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const convert = (raw: any): FrontTracking => {
    if (raw?.neighbors?.length > 0) {
        raw.neighbors.forEach(convertNeighbor);
    }

    return raw as FrontTracking;
};

const convertNeighbor = raw => {
    if (raw && raw.dates && raw.dates.length > 0) {
        raw.dates.forEach(x => {
            x.date = new Date(x.date);
        });
    }
};
