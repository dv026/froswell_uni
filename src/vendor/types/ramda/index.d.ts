// declare module 'ramda_extended' {
//     module 'ramda' {
//         interface Static {
//             innerJoin(a: any, b: any): any;
//             innerJoin(a: any, b: any, c: any): any;

//             dropRepeats<T>(x: T[]): T[];
//         }
//     }
// }

declare module 'ramda_extended' {
    import { T } from 'ramda';
    module 'ramda' {
        export function propEq<T>(name: keyof T, val: T[keyof T]): (obj: T) => boolean;

        export function partial<V0, V1, V2, V3, V4, T>(
            fn: (x0: V0, x1: V1, x2: V2, x3: V3, x4: V4) => T,
            args: [V0, V1, V2, V3]
        ): (x4: V4) => T;
        export function partial<V0, V1, V2, V3, V4, T>(
            fn: (x0: V0, x1: V1, x2: V2, x3: V3, x4: V4) => T,
            args: [V0, V1, V2]
        ): (x3: V3, x4: V4) => T;
        export function partial<V0, V1, V2, V3, V4, T>(
            fn: (x0: V0, x1: V1, x2: V2, x3: V3, x4: V4) => T,
            args: [V0, V1]
        ): (x2: V2, x3: V3, x4: V4) => T;
        export function partial<V0, V1, V2, V3, V4, T>(
            fn: (x0: V0, x1: V1, x2: V2, x3: V3, x4: V4) => T,
            args: [V0]
        ): (x1: V1, x2: V2, x3: V3, x4: V4) => T;
    }
}
