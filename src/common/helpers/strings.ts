export const hashCode = (msg: string): number => {
    let hash = 0,
        i,
        chr;
    if (!msg.length) {
        return hash;
    }

    for (i = 0; i < msg.length; i++) {
        chr = msg.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
};

const idxFrom = 2;
const rdx = 36;
const leftEndIdx = (length: number) => idxFrom + Math.round(length / 2) - 1;
const rightEndIdx = (length: number) => idxFrom + Math.floor(length / 2) - 1;
export const uid = (length: number = 6): string =>
    Math.random().toString(rdx).substring(idxFrom, leftEndIdx(length)) +
    Math.random().toString(rdx).substring(idxFrom, rightEndIdx(length));

/**
 * Конвертирует строку, содержащую unicode символы в строку
 * @param input входящая строка
 */
export const u = (input: string): string =>
    input.replace(/\\u(\w\w\w\w)/g, function (a, b) {
        return String.fromCharCode(parseInt(b, 16));
    });

export const valueProp = (idx: string | number): string => `value_${idx}`;

export const capitalizeFirstLetter = string => {
    return string && string.charAt(0).toUpperCase() + string.slice(1);
};

export const truncateString = (str: string, num: number) => {
    return str?.length > num ? str.slice(0, num) + '...' : str;
};
