export const ticksLessThan = (count: number, min: number, max: number): number[] => {
    if (count === 0) {
        return [];
    }

    const dx = (max - min) / count;
    if (dx === 0) {
        return [min];
    }

    const digits = digitsCount(dx);
    const mult = Math.pow(10, digits);

    let stepSize =
        Math.floor((dx + mult) / mult) * mult === dx
            ? dx
            : dx > 1 && dx < 10
            ? 10
            : Math.floor((dx + mult) / mult) * mult;

    let current = 0;
    let result = [min];
    while (current <= max) {
        if (current > min) {
            result.push(current);
        }

        current += stepSize;
    }

    if (result[result.length - 1] !== max) {
        result.push(max);
    }

    return result;
};

export const digitsCount = (x: number): number => {
    if (x < 0) {
        throw new Error("value can't be less than zero. [NotImplemented]");
    }

    if (!x) {
        return 0;
    }

    let count = 0;
    if (x > 0 && x < 1) {
        while (x * 10 < 1) {
            x *= 10;
            count--;
        }

        return count;
    }

    while (x / 10 >= 1) {
        x /= 10;
        count++;
    }

    return count;
};

// TODO: типизация
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const getFirstIndex = (data: any[], field: string, x: Date): number => {
    let index = 0;

    for (let i = 0; i < data.length; i++) {
        if (x.getTime() === new Date(data[i][field]).getTime()) {
            return i;
        }
    }

    return index;
};
