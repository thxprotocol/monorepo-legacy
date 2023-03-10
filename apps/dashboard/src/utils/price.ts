export function parseUnitAmount(price: number) {
    return Number(price / 100).toFixed(2);
}
