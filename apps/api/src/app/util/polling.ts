export async function poll<T>(fn: () => Promise<T>, fnCondition: (result: T) => boolean, ms: number) {
    let result = await fn();
    while (fnCondition(result)) {
        await wait(ms);
        result = await fn();
    }
    return result;
}

function wait(ms = 1000) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
