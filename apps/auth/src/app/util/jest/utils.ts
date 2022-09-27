export function getPath(url: string) {
    return '/' + url.split('/')[3] + '/' + url.split('/')[4];
}
