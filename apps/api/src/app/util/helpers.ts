export const pick = <T, K extends keyof T>(object: T, keys: K[]): Pick<T, K> => {
    return Object.assign(
        {},
        ...keys.map((key) => {
            if (object && Object.prototype.hasOwnProperty.call(object, key)) {
                return { [key]: object[key] };
            }
        }),
    );
};

export const uniq = <T>(array: T[]): T[] => {
    return [...new Set(array)];
};

export const sleep = async (seconds: number) => {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const convertObjectIdToNumber = (objectId: string) => {
    // Extract the timestamp part of the ObjectId (first 4 bytes)
    return parseInt(objectId.toString().substring(0, 8), 16);
};
