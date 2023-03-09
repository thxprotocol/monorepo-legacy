export function generateRandomString(length: number) {
    return (+new Date() * Math.random()).toString(36).substring(0, length);
}
