export function parseUnitAmount(price: number) {
    return Number(price / 100).toFixed(2);
}

export function toFiatPrice(number: number) {
    // Replace 'en-US' with the appropriate locale for your application
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // Change this to the desired currency code
        minimumFractionDigits: 2,
    });

    return formatter.format(number);
}
