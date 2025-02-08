const mean = (list: number[]): number => list.reduce((acc, val) => acc + val, 0) / list.length;

const covariance = (list1: number[], list2: number[]): number => {
    if (list1.length !== list2.length) {
        throw new Error('Lists must have the same length');
    }
    const mean1 = mean(list1);
    const mean2 = mean(list2);
    return list1.reduce((acc, val, index) => acc + (val - mean1) * (list2[index] - mean2), 0) / list1.length;
};

const standardDeviation = (list: number[]): number => {
    const avg = mean(list);
    const squaredDiffs = list.map(val => Math.pow(val - avg, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / list.length;
    return Math.sqrt(variance);
};

const correlationCoefficient = (list1: number[], list2: number[]): number => {
    const cov = covariance(list1, list2);
    const stdDev1 = standardDeviation(list1);
    const stdDev2 = standardDeviation(list2);
    return cov / (stdDev1 * stdDev2);
};

export const computeCorrelationCoefficients = (...lists: number[][]): number => {
    const n = lists.length;
    let totalCorrelation = 0;

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const coef = correlationCoefficient(lists[i], lists[j]);
            totalCorrelation += coef;
        }
    }

    return totalCorrelation / ((n * (n - 1)) / 2); // Average of all pairwise correlations
};
