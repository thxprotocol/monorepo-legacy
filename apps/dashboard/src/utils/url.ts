const URL_REGEX = /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
const HTTP_REGEX = /^https?:\/\//i;

export const isValidUrl = (url: string) => {
    return URL_REGEX.test(url) != null && HTTP_REGEX.test(url);
};
