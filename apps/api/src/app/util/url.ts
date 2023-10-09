const URL_REGEX = /^(https?):\/\/[^\s/$.?#].[^\s]*$/i;
export const isValidUrl = (url: string) => url.match(URL_REGEX);
