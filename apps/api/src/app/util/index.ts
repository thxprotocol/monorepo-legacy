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
