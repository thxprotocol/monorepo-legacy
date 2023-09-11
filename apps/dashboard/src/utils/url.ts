const URL_REGEX =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
const HTTP_REGEX = /https?:\/\//g;

export const isValidUrl = (url: string) => {
    const matches = url.match(HTTP_REGEX);
    return URL_REGEX.test(url) != null && HTTP_REGEX.test(url) && matches && matches.length === 1;
};
